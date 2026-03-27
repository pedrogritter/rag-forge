import { db } from "@/server/db";
import { resources, embeddings as embeddingsTable } from "@/server/db/schema";
import { generateEmbeddings } from "@/core/lib/ai/embedding";
import { nanoid } from "@/core/lib/utils";
import { sql } from "drizzle-orm";
import { vectorConfig } from "@/config/vector.config";
import type {
  ExtractedDocument,
  IngestionResult,
  DocumentChunk,
} from "./types";

const { maxChunksPerBatch, embeddingTimeout } = vectorConfig.ingestion;

class EmbeddingTimeoutError extends Error {
  constructor() {
    super("Embedding generation timeout");
    this.name = "EmbeddingTimeoutError";
  }
}

async function generateEmbeddingsWithTimeout(
  content: string[],
  timeout: number = embeddingTimeout,
): Promise<{ embedding: number[]; content: string }[]> {
  let timeoutId: NodeJS.Timeout;
  return Promise.race([
    generateEmbeddings(content),
    new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new EmbeddingTimeoutError()),
        timeout,
      );
    }),
  ]).finally(() => {
    if (timeoutId!) clearTimeout(timeoutId);
  });
}

async function insertEmbedding(
  resourceId: string,
  chunkContent: string,
  embedding: number[],
  metadata?: { pageNumber?: number; pageTitle?: string },
): Promise<void> {
  const formattedEmbedding = `[${embedding.join(",")}]`;
  await db.insert(embeddingsTable).values({
    id: nanoid(),
    resourceId,
    content: chunkContent,
    embedding: sql`${formattedEmbedding}::vector`,
    searchVector: sql`to_tsvector('english', ${chunkContent})`,
    pageNumber: metadata?.pageNumber ?? null,
    pageTitle: metadata?.pageTitle ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Ingest an extracted document: create a resource, generate embeddings
 * in batches, and store them in the database.
 */
export async function ingestDocument(
  doc: ExtractedDocument,
): Promise<IngestionResult> {
  // Determine resource type from file extension
  const isPdf = doc.filename.toLowerCase().endsWith(".pdf");

  // Create the resource record
  const resourceId = nanoid();
  await db.insert(resources).values({
    id: resourceId,
    content: `Document: ${doc.filename}`,
    type: isPdf ? "pdf" : "text",
    filename: doc.filename,
    pageCount: doc.pageCount ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  let embeddingsCount = 0;
  const chunks = doc.chunks.filter((c) => c.content.trim().length > 0);

  // Process chunks in batches
  for (let i = 0; i < chunks.length; i += maxChunksPerBatch) {
    const batch = chunks.slice(i, i + maxChunksPerBatch);
    const batchTexts = batch.map((c: DocumentChunk) => c.content);

    try {
      const results = await generateEmbeddingsWithTimeout(batchTexts);

      await Promise.allSettled(
        results.map((result, idx) =>
          insertEmbedding(resourceId, result.content, result.embedding, batch[idx]?.metadata),
        ),
      );

      embeddingsCount += results.length;
    } catch {
      // Continue with next batch on failure
      continue;
    }
  }

  return {
    filename: doc.filename,
    chunksProcessed: chunks.length,
    embeddingsCount,
    resourceId,
  };
}
