import type { DocumentProcessor } from "./types";
import { pdfProcessor } from "./processors/pdf";
import { textProcessor } from "./processors/text";

export type { DocumentProcessor, ExtractedDocument, IngestionResult, DocumentChunk } from "./types";
export { ingestDocument } from "./pipeline";
export { chunkText, chunkMarkdown } from "./chunking";

const processors: DocumentProcessor[] = [pdfProcessor, textProcessor];

/**
 * Get the processor for a given filename based on its extension.
 * Returns undefined if no processor supports the file type.
 */
export function getProcessorForFile(
  filename: string,
): DocumentProcessor | undefined {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return processors.find((p) => p.supportedExtensions.includes(ext));
}

/** All file extensions that have a registered processor. */
export const supportedExtensions = processors.flatMap(
  (p) => p.supportedExtensions,
);
