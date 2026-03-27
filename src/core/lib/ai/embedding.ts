import { embed, embedMany } from "ai";
import { db } from "@/server/db";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { embeddings } from "@/server/db/schema/embeddings";
import { resources } from "@/server/db/schema/resources";
import { vectorConfig } from "@/config/vector.config";
import { getEmbeddingModel } from "@/core/lib/ai/providers";

const embeddingModel = getEmbeddingModel();

const embeddingProviderOptions = {
  openai: { dimensions: vectorConfig.embedding.dimensions },
};

/**
 * Generates vector embeddings for one or more text inputs.
 * @param value - A string or array of strings to embed.
 * @returns An array of objects with the original content and its embedding.
 */
export const generateEmbeddings = async (
  value: string | string[],
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const values = Array.isArray(value) ? value : [value];
  const { embeddings: resultEmbeddings } = await embedMany({
    model: embeddingModel,
    values,
    providerOptions: embeddingProviderOptions,
  });
  // Ensure content is always a string (never undefined)
  return resultEmbeddings.map((embedding, i) => ({
    content: values[i] ?? "",
    embedding,
  }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
    providerOptions: embeddingProviderOptions,
  });

  return embedding;
};

export const findRelevantContent = async (
  userQuery: string,
  overrides?: { topK?: number; similarityThreshold?: number },
) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const topK = overrides?.topK ?? vectorConfig.search.topK;
  const similarityThreshold =
    overrides?.similarityThreshold ?? vectorConfig.search.similarityThreshold;
  const { search } = vectorConfig;

  // Vector similarity search (cosine) with PDF metadata
  const vectorSimilarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;

  // Full-text keyword search (tsvector) with PDF metadata
  const tsQuery = sql`plainto_tsquery('english', ${userQuery})`;
  const textRank = sql<number>`ts_rank(${embeddings.searchVector}, ${tsQuery})`;

  // Run vector and keyword searches in parallel (independent queries)
  const [vectorResults, keywordResults] = await Promise.all([
    db
      .select({
        id: embeddings.id,
        content: embeddings.content,
        score: vectorSimilarity,
        filename: resources.filename,
        pageNumber: embeddings.pageNumber,
        pageTitle: embeddings.pageTitle,
      })
      .from(embeddings)
      .innerJoin(resources, sql`${resources.id} = ${embeddings.resourceId}`)
      .where(gt(vectorSimilarity, similarityThreshold))
      .orderBy(desc(vectorSimilarity))
      .limit(topK),

    db
      .select({
        id: embeddings.id,
        content: embeddings.content,
        score: textRank,
        filename: resources.filename,
        pageNumber: embeddings.pageNumber,
        pageTitle: embeddings.pageTitle,
      })
      .from(embeddings)
      .innerJoin(resources, sql`${resources.id} = ${embeddings.resourceId}`)
      .where(sql`${embeddings.searchVector} @@ ${tsQuery}`)
      .orderBy(desc(textRank))
      .limit(topK),
  ]);

  // Reciprocal Rank Fusion (RRF) to combine results
  const k = 60; // RRF constant
  const scoreMap = new Map<
    string,
    {
      content: string;
      score: number;
      resourceName?: string;
      pageNumber?: number;
      pageTitle?: string;
    }
  >();

  vectorResults.forEach((result, rank) => {
    const rrfScore = search.vectorWeight / (k + rank + 1);
    scoreMap.set(result.id, {
      content: result.content,
      score: rrfScore,
      resourceName: result.filename ?? undefined,
      pageNumber: result.pageNumber ?? undefined,
      pageTitle: result.pageTitle ?? undefined,
    });
  });

  keywordResults.forEach((result, rank) => {
    const rrfScore = search.keywordWeight / (k + rank + 1);
    const existing = scoreMap.get(result.id);
    if (existing) {
      existing.score += rrfScore;
    } else {
      scoreMap.set(result.id, {
        content: result.content,
        score: rrfScore,
        resourceName: result.filename ?? undefined,
        pageNumber: result.pageNumber ?? undefined,
        pageTitle: result.pageTitle ?? undefined,
      });
    }
  });

  // Sort by fused score and return top results with metadata for attribution
  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ content, score, resourceName, pageNumber, pageTitle }) => ({
      content,
      similarity: score,
      resourceName,
      pageNumber,
      pageTitle,
    }));
};
