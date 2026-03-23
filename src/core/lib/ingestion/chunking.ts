import { vectorConfig } from "@/config/vector.config";

const { chunkSize, chunkOverlap } = vectorConfig.ingestion;

/**
 * Split text into overlapping chunks using recursive character splitting.
 * Tries to split on structural boundaries first (headings, paragraphs, sentences),
 * falling back to character boundaries.
 */
export function chunkText(
  text: string,
  maxChunkSize: number = chunkSize,
  overlap: number = chunkOverlap,
): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  if (trimmed.length <= maxChunkSize) return [trimmed];

  const chunks: string[] = [];
  let startIndex = 0;
  const MAX_ITERATIONS = 10000;
  let iterations = 0;

  while (startIndex < trimmed.length && iterations < MAX_ITERATIONS) {
    let endIndex = Math.min(startIndex + maxChunkSize, trimmed.length);

    // Try to end on a sentence boundary within the last 20% of the chunk
    if (endIndex < trimmed.length) {
      const searchStart = Math.max(
        endIndex - Math.floor(maxChunkSize * 0.2),
        startIndex,
      );
      const searchArea = trimmed.substring(searchStart, endIndex);
      const matches = Array.from(searchArea.matchAll(/[.!?]\s+/g));
      const lastMatch =
        matches.length > 0 ? matches[matches.length - 1] : undefined;
      if (lastMatch?.index !== undefined) {
        endIndex = searchStart + lastMatch.index + lastMatch[0].length;
      }
    }

    const currentChunk = trimmed.substring(startIndex, endIndex).trim();
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    if (endIndex >= trimmed.length || endIndex <= startIndex) break;

    startIndex = Math.max(0, endIndex - overlap);
    iterations++;
  }

  return chunks;
}

/**
 * Split markdown text into chunks aware of heading structure.
 * Splits on ## and ### headings first, then falls back to chunkText
 * for sections larger than maxChunkSize.
 */
export function chunkMarkdown(
  text: string,
  maxChunkSize: number = chunkSize,
  overlap: number = chunkOverlap,
): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  if (trimmed.length <= maxChunkSize) return [trimmed];

  // Split on markdown headings (## or ###)
  const sections = trimmed.split(/(?=^#{1,3}\s)/m);
  const chunks: string[] = [];

  for (const section of sections) {
    const cleaned = section.trim();
    if (cleaned.length === 0) continue;

    if (cleaned.length <= maxChunkSize) {
      chunks.push(cleaned);
    } else {
      // Section too large — split on double newlines (paragraphs)
      const paragraphs = cleaned.split(/\n\n+/);
      let buffer = "";

      for (const para of paragraphs) {
        const trimPara = para.trim();
        if (trimPara.length === 0) continue;

        if (buffer.length + trimPara.length + 2 <= maxChunkSize) {
          buffer = buffer ? buffer + "\n\n" + trimPara : trimPara;
        } else {
          if (buffer.length > 0) {
            chunks.push(buffer);
          }
          // If a single paragraph is still too large, use character-level chunking
          if (trimPara.length > maxChunkSize) {
            chunks.push(...chunkText(trimPara, maxChunkSize, overlap));
          } else {
            buffer = trimPara;
          }
          if (trimPara.length <= maxChunkSize) {
            buffer = trimPara;
          } else {
            buffer = "";
          }
        }
      }

      if (buffer.length > 0) {
        chunks.push(buffer);
      }
    }
  }

  return chunks;
}
