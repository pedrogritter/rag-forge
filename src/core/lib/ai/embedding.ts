import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/server/db";
import { cosineDistance, desc, gt, sql, eq } from "drizzle-orm";
import { embeddings } from "@/server/db/schema/embeddings";
import { pdfResources, pdfEmbeddings } from "@/server/db/schema/pdf-resources";

const embeddingModel = openai.embedding("text-embedding-ada-002");

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
  });

  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;

  const similarContent = await db
    .select({
      content: embeddings.content,
    })
    .from(embeddings)
    .leftJoin(pdfEmbeddings, eq(pdfEmbeddings.embeddingId, embeddings.id))
    .leftJoin(pdfResources, eq(pdfResources.resourceId, embeddings.resourceId))
    .where(gt(similarity, 0.5))
    .orderBy(desc(similarity))
    .limit(15);

  return similarContent;
};
