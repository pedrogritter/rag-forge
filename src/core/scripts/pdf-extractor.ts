#!/usr/bin/env node

import path from "path";
import fs from "fs/promises";
import { createHash } from "crypto";
import {
  pdfResources,
  resources,
  embeddings as embeddingsTable,
  pdfEmbeddings,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { eq, and, sql } from "drizzle-orm";
import { readPdfText } from "pdf-text-reader";
import { generateEmbeddings } from "../lib/ai/embedding";
import { nanoid } from "nanoid";
import pLimit from "p-limit";
import pino from "pino";
import "dotenv/config";

// CLI flag for verbose logging
const isVerbose = process.argv.includes("--verbose");

const logger = pino({
  level: isVerbose ? "debug" : "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

const PDF_DIRECTORY = path.join(process.cwd(), "src/data");
const MAX_CHUNK_SIZE = 1000; // Chunk size limit in characters.
const OVERLAP_SIZE = 50; // Overlap window between chunks
const MAX_CHUNKS_PER_BATCH = 5; // Maximum batch to upload
const MAX_PAGE_SIZE = 25000; // Page size limit in characters
const EMBEDDING_TIMEOUT = 30000; // Timeout of embedding in seconds ? confirm

// Interfaces
interface PageContent {
  pageNumber: number;
  title?: string;
  content: string;
}

interface PDFContent {
  filename: string;
  pages: PageContent[];
}

// These are specifics to pdf reader extension
interface PDFPage {
  lines?: string[];
  text?: string;
  title?: string;
  [key: string]: any;
}

// Utility functions

/**
 * Generates a SHA-256 hash for a file to uniquely identify it.
 * @param filePath - The path to the file.
 * @returns The SHA-256 hash as a hex string.
 */
async function generateFileHash(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return createHash("sha256").update(buffer.toString("binary")).digest("hex");
}

/**
 * Checks if a given PDF file has already been processed and indexed in the database.
 * @param fileName - The name of the file.
 * @param fileHash - The hash of the file.
 * @returns True if the file has been processed, false otherwise.
 */
async function hasPDFBeenProcessed(
  fileName: string,
  fileHash: string,
): Promise<boolean> {
  const existingResource = await db
    .select({ id: pdfResources.id })
    .from(pdfResources)
    .where(
      and(
        eq(pdfResources.filename, fileName),
        eq(pdfResources.fileHash, fileHash),
      ),
    )
    .limit(1);

  return existingResource.length > 0;
}

/**
 * Extracts and cleans text content from a PDF file, returning structured page data.
 * @param filePath - The path to the PDF file.
 * @returns An object containing the filename and an array of page contents.
 */
async function extractTextFromPDF(filePath: string): Promise<PDFContent> {
  logger.info(`Extracting text from ${filePath}...`);
  const filename = path.basename(filePath);

  try {
    const pdfPages = (await readPdfText(filePath)) as PDFPage[];
    logger.info(`Sucessfully read ${pdfPages.length} pages from PDF file`);
    const pages: PageContent[] = [];

    if (Array.isArray(pdfPages)) {
      for (let i = 0; i < pdfPages.length; i++) {
        const page = pdfPages[i];
        const rawContent = page?.lines
          ? page.lines.join(" ")
          : page?.text || "";
        const content = rawContent
          .replace(/\s+/g, " ")
          .replace(/\n+/g, " ")
          .trim();

        if (content.length > 0) {
          logger.info(
            `Page ${i + 1}: Content Length = ${content.length} characters`,
          );

          pages.push({
            pageNumber: i + 1,
            title: page?.title,
            content: content,
          });
        } else {
          logger.info(`Page ${i + 1}: Skipping empty page`);
        }
      }
    }
    logger.info(`Processed ${pages.length} pages from PDF file.`);
    return { filename, pages };
  } catch (error) {
    logger.error(`Error extracting content from ${filename}: `, error);
    throw error;
  }
}

/**
 * Breaks long text into overlapping, semantically meaningful chunks for embedding.
 * @param text - The text to chunk.
 * @param maxChunkSize - Maximum size of each chunk (default: MAX_CHUNK_SIZE).
 * @param overlap - Number of overlapping characters between chunks (default: OVERLAP_SIZE).
 * @returns An array of text chunks.
 */
function chunkText(
  text: string,
  maxChunkSize: number = MAX_CHUNK_SIZE,
  overlap: number = OVERLAP_SIZE,
): string[] {
  const chunks: string[] = [];
  let startIndex = 0;
  let iterations = 0;
  const MAX_ITERATIONS = 10000;

  while (startIndex < text.length && iterations < MAX_ITERATIONS) {
    let endIndex = Math.min(startIndex + maxChunkSize, text.length);

    // Try to end on a sentence boundary
    if (endIndex < text.length) {
      const searchStart = Math.max(
        endIndex - Math.floor(maxChunkSize * 0.2),
        startIndex,
      );
      const searchArea = text.substring(searchStart, endIndex);
      const matches = Array.from(searchArea.matchAll(/[.!?]\s+/g));
      const lastMatch =
        matches.length > 0 ? matches[matches.length - 1] : undefined;
      if (lastMatch?.index !== undefined) {
        endIndex = searchStart + lastMatch.index + lastMatch[0].length;
      }
    }

    const currentChunk = text.substring(startIndex, endIndex).trim();
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // If we're at the end or can't advance, break
    if (endIndex >= text.length || endIndex <= startIndex) {
      break;
    }

    startIndex = Math.max(0, endIndex - overlap);
    iterations++;
  }

  if (iterations === MAX_ITERATIONS) {
    logger.warn("Max iterations reached in chunkText.");
  }

  return chunks;
}

/**
 * Custom error class for embedding generation timeouts.
 */
class EmbeddingTimeoutError extends Error {
  constructor(message = "Embedding generation timeout") {
    super(message);
    this.name = "EmbeddingTimeoutError";
  }
}

/**
 * Generates vector embeddings for a chunk or array of text with a timeout safeguard.
 * @param content - The text content(s) to embed.
 * @param timeout - Timeout in milliseconds (default: EMBEDDING_TIMEOUT).
 * @returns The embedding result(s) or throws on timeout.
 */
async function generateEmbeddingsWithTimeout(
  content: string | string[],
  timeout: number = EMBEDDING_TIMEOUT,
): Promise<any> {
  let timeoutId: NodeJS.Timeout;
  return Promise.race([
    generateEmbeddings(content),
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new EmbeddingTimeoutError());
      }, timeout);
    }),
  ]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

/**
 * Saves a PDF resource and its metadata to the database.
 * @param filename - The name of the PDF file.
 * @param fileHash - The hash of the PDF file.
 * @param pageCount - The number of pages in the PDF.
 * @returns The resource ID of the saved PDF.
 */
async function savePDFResource(
  filename: string,
  fileHash: string,
  pageCount: number,
): Promise<string> {
  logger.info(`Saving PDF Resource: ${filename}`);

  try {
    const resourceId = nanoid();

    // Insert basic resource record
    await db.insert(resources).values({
      id: resourceId,
      content: `PDF: ${filename}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert PDF-specific resource record
    await db.insert(pdfResources).values({
      id: nanoid(),
      resourceId: resourceId,
      filename: filename,
      fileHash: fileHash,
      pageCount: pageCount,
      lastProcessedAt: new Date(),
    });

    return resourceId;
  } catch (error) {
    logger.error(`Error saving PDF resource ${filename}: `, error);
    throw error;
  }
}

/**
 * Inserts an embedding and its metadata into the database.
 * @param params - Embedding data and metadata.
 */
async function insertEmbeddingAndMetadata({
  embedding,
  chunkContent,
  resourceId,
  pageNumber,
  pageTitle,
}: {
  embedding: number[];
  chunkContent: string;
  resourceId: string;
  pageNumber: number;
  pageTitle?: string | null;
}) {
  const embeddingId = nanoid();
  const formattedEmbedding = `[${embedding.join(",")}]`;
  await db.insert(embeddingsTable).values({
    id: embeddingId,
    resourceId,
    content: chunkContent,
    embedding: sql`${formattedEmbedding}::vector`,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(pdfEmbeddings).values({
    id: nanoid(),
    embeddingId,
    pageNumber,
    pageTitle: pageTitle ?? null,
  });
}

/**
 * Processes a single PDF page's content: chunks, embeds, and stores in the database.
 * Batches all chunks for a section and calls generateEmbeddingsWithTimeout with the batch array.
 * @param page - The page content to process.
 * @param resourceId - The resource ID for the PDF.
 * @returns The number of embeddings generated for the page.
 */
async function processPageContent(
  page: PageContent,
  resourceId: string,
): Promise<number> {
  if (
    !page?.content ||
    typeof page.content !== "string" ||
    !page.content.trim()
  ) {
    logger.warn(`Page ${page?.pageNumber ?? "?"} has no content. Skipping.`);
    return 0;
  }

  let totalEmbeddings = 0;
  const { content, pageNumber, title: pageTitle } = page;
  logger.info(`Processing page: ${pageNumber}`);
  logger.info(`Total Content Length: ${content.length} characters`);

  // Efficient sectioning
  const sections = Array.from(
    { length: Math.ceil(content.length / MAX_PAGE_SIZE) },
    (_, i) => content.slice(i * MAX_PAGE_SIZE, (i + 1) * MAX_PAGE_SIZE),
  );

  for (const [sectionIndex, section] of sections.entries()) {
    logger.info(`\nProcessing section ${sectionIndex + 1}/${sections.length}:`);
    const chunks = chunkText(section);
    logger.info(`Generated ${chunks.length} chunks from section`);

    // Batch embedding using OpenAI API's batch support
    for (let j = 0; j < chunks.length; j += MAX_CHUNKS_PER_BATCH) {
      const batchChunks = chunks.slice(j, j + MAX_CHUNKS_PER_BATCH);
      logger.info(
        `Processing batch ${Math.floor(j / MAX_CHUNKS_PER_BATCH) + 1}/` +
          `${Math.ceil(chunks.length / MAX_CHUNKS_PER_BATCH)}`,
      );

      try {
        // Call generateEmbeddingsWithTimeout with an array of strings
        const embeddingsResults =
          await generateEmbeddingsWithTimeout(batchChunks);
        // Insert all embeddings in parallel
        await Promise.allSettled(
          embeddingsResults.map(
            (result: { embedding: number[]; content: string }) =>
              insertEmbeddingAndMetadata({
                embedding: result.embedding,
                chunkContent: result.content,
                resourceId,
                pageNumber,
                pageTitle,
              }),
          ),
        );
        totalEmbeddings += embeddingsResults.length;
        if (totalEmbeddings % MAX_CHUNKS_PER_BATCH === 0) {
          logger.info(`Progress: ${totalEmbeddings} embeddings generated`);
        }
        // Throttle to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        logger.error(`Error processing batch:`, error);
        continue;
      }
      // Optional: Run garbage collection after each batch
      if (global.gc) {
        logger.info("\nRunning garbage collection...");
        global.gc();
      }
    }
  }

  logger.info(`\nCompleted processing page ${pageNumber}`);
  logger.info(`Total embeddings generated: ${totalEmbeddings}`);
  return totalEmbeddings;
}

/**
 * Processes and saves the embeddings of a PDF file, page by page, in parallel (limit 3).
 * @param resourceId - The resource ID for the PDF.
 * @param pdfContent - The extracted PDF content.
 * @returns The total number of embeddings generated for the PDF.
 */
async function saveEmbeddings(
  resourceId: string,
  pdfContent: PDFContent,
): Promise<number> {
  logger.info(`Generating embeddings for: ${pdfContent.filename}`);
  let totalEmbeddings = 0;
  const limit = pLimit(3); // Limit to 3 concurrent page processes

  try {
    const results = await Promise.allSettled(
      pdfContent.pages
        .filter((page) => page.content && page.content.trim().length > 0)
        .map((page) => limit(() => processPageContent(page, resourceId))),
    );
    for (const result of results) {
      if (result.status === "fulfilled") {
        totalEmbeddings += result.value;
      } else {
        logger.error("Error processing page:", result.reason);
      }
    }
    if (global.gc) {
      global.gc();
    }
    return totalEmbeddings;
  } catch (error) {
    logger.error(
      `Error saving embeddings for ${pdfContent.filename}: ${error}`,
    );
    throw error;
  }
}

/**
 * Processes a single PDF file: checks if processed, extracts text, saves resource, and generates embeddings.
 * @param filePath - The path to the PDF file.
 * @returns An object with filename, processed status, and embeddings count.
 */
async function processPDF(filePath: string): Promise<{
  filename: string;
  processed: boolean;
  embeddingsCount: number;
}> {
  const filename = path.basename(filePath);
  logger.info(`Processing PDF: ${filename}`);

  try {
    const fileHash = await generateFileHash(filePath);

    if (await hasPDFBeenProcessed(filename, fileHash)) {
      logger.info(`PDF File - ${filename} - already processed. Skipping.`);
      return { filename, processed: false, embeddingsCount: 0 };
    }

    const pdfContent = await extractTextFromPDF(filePath);
    const resourceId = await savePDFResource(
      filename,
      fileHash,
      pdfContent.pages.length,
    );
    const embeddingsCount = await saveEmbeddings(resourceId, pdfContent);

    logger.info(
      `Sucessfully processed ${filename}: ${embeddingsCount} embeddings saved!`,
    );

    return { filename, processed: true, embeddingsCount };
  } catch (error) {
    logger.error(`Error processing PDF: ${filename}:, ${error}`);
    throw error;
  }
}

/**
 * Processes all PDF files in the data directory in parallel (limit 2).
 */
async function processAllPDFs(): Promise<void> {
  try {
    await fs.mkdir(PDF_DIRECTORY, { recursive: true }).catch(() => {});

    const files = await fs.readdir(PDF_DIRECTORY);
    const pdfFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".pdf"),
    );

    logger.info(`Found ${pdfFiles.length} PDF files in the data directory.`);

    if (pdfFiles.length === 0) {
      logger.info(
        `No PDF files where found. Please add PDFs into the data directory.`,
      );
      return;
    }

    const limit = pLimit(2); // Limit to 2 concurrent PDF processes
    const results: Array<{
      filename: string;
      processed: boolean;
      embeddingsCount: number;
    }> = [];

    const settledResults = await Promise.allSettled(
      pdfFiles.map((pdf) =>
        limit(async () => {
          const filePath = path.join(PDF_DIRECTORY, pdf);
          const result = await processPDF(filePath);
          results.push(result);
        }),
      ),
    );

    logger.info("Results:", settledResults);

    for (const res of settledResults) {
      if (res.status === "rejected") {
        logger.error("Error processing PDF - rejected:", res.reason);
      }
    }

    const processedCount = results.filter((r) => r.processed).length;
    const totalEmbeddings = results.reduce(
      (sum, r) => sum + r.embeddingsCount,
      0,
    );
    logger.info("\n=== PDF Processing Summary ===");
    logger.info(`Total PDFs: ${pdfFiles.length}`);
    logger.info(`Processed: ${processedCount}`);
    logger.info(`Skipped: ${pdfFiles.length - processedCount}`);
    logger.info(`Total embeddings generated: ${totalEmbeddings}`);
    logger.info("===============================");
  } catch (error) {
    logger.error(`Error processing PDFs from directory: ${error}`);
    throw error;
  }
}

processAllPDFs()
  .then(() => {
    logger.info("PDF processing completed.");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Fatal error during PDF processing:", error);
    process.exit(1);
  });
