import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/server/db";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { embeddings } from "@/server/db/schema/embeddings";
import { vectorConfig } from "@/config/vector.config";

const embeddingModel = openai.embedding(vectorConfig.embedding.model);

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

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const { search } = vectorConfig;

  // Vector similarity search (cosine)
  const vectorSimilarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;

  const vectorResults = await db
    .select({
      id: embeddings.id,
      content: embeddings.content,
      score: vectorSimilarity,
    })
    .from(embeddings)
    .where(gt(vectorSimilarity, search.similarityThreshold))
    .orderBy(desc(vectorSimilarity))
    .limit(search.topK);

  // Full-text keyword search (tsvector)
  const tsQuery = sql`plainto_tsquery('english', ${userQuery})`;
  const textRank = sql<number>`ts_rank(${embeddings.searchVector}, ${tsQuery})`;

  const keywordResults = await db
    .select({
      id: embeddings.id,
      content: embeddings.content,
      score: textRank,
    })
    .from(embeddings)
    .where(sql`${embeddings.searchVector} @@ ${tsQuery}`)
    .orderBy(desc(textRank))
    .limit(search.topK);

  // Reciprocal Rank Fusion (RRF) to combine results
  const k = 60; // RRF constant
  const scoreMap = new Map<string, { content: string; score: number }>();

  vectorResults.forEach((result, rank) => {
    const rrfScore = search.vectorWeight / (k + rank + 1);
    scoreMap.set(result.id, {
      content: result.content,
      score: rrfScore,
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
      });
    }
  });

  // Sort by fused score and return top results
  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, search.topK)
    .map(({ content }) => ({ content }));
};
