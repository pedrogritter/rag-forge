import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/server/db";
import { cosineDistance, desc, gt, sql, eq } from "drizzle-orm";
import { embeddings } from "@/server/db/schema/embeddings";
import { pdfResources, pdfEmbeddings } from "@/server/db/schema/pdf-resources";

const embeddingModel = openai.embedding("text-embedding-ada-002");

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: [value], // Treat input as single chunk
  });

  return embeddings.map((e) => ({ content: value, embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
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
    .limit(10);

  return similarContent;
};
