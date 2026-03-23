/**
 * Document ingestion types.
 *
 * A DocumentProcessor extracts text from a file and returns structured chunks.
 * The ingestion pipeline handles embedding + storage.
 */

export interface DocumentChunk {
  content: string;
  metadata?: {
    pageNumber?: number;
    pageTitle?: string;
    section?: string;
  };
}

export interface ExtractedDocument {
  filename: string;
  chunks: DocumentChunk[];
  pageCount?: number;
}

export interface DocumentProcessor {
  /** File extensions this processor handles (e.g. [".pdf"]) */
  supportedExtensions: string[];

  /** Extract text from a file buffer and return structured chunks */
  extract(buffer: Buffer, filename: string): Promise<ExtractedDocument>;
}

export interface IngestionResult {
  filename: string;
  chunksProcessed: number;
  embeddingsCount: number;
  resourceId: string;
}
