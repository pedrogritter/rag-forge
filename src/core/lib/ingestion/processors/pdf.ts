import { extractText } from "unpdf";
import { chunkText } from "../chunking";
import { vectorConfig } from "@/config/vector.config";
import type {
  DocumentProcessor,
  ExtractedDocument,
  DocumentChunk,
} from "../types";

const { maxPageSize } = vectorConfig.ingestion;

export const pdfProcessor: DocumentProcessor = {
  supportedExtensions: [".pdf"],

  async extract(buffer: Buffer, filename: string): Promise<ExtractedDocument> {
    const result = await extractText(new Uint8Array(buffer), { mergePages: false });
    const pages = result.text;

    const chunks: DocumentChunk[] = [];
    let pageCount = 0;

    for (let i = 0; i < pages.length; i++) {
      const content = (pages[i] ?? "")
        .replace(/\s+/g, " ")
        .replace(/\n+/g, " ")
        .trim();

      if (content.length === 0) continue;
      pageCount++;

      // Split oversized pages into sections
      const sections =
        content.length > maxPageSize
          ? Array.from(
              { length: Math.ceil(content.length / maxPageSize) },
              (_, j) => content.slice(j * maxPageSize, (j + 1) * maxPageSize),
            )
          : [content];

      for (const section of sections) {
        const textChunks = chunkText(section);
        for (const text of textChunks) {
          chunks.push({
            content: text,
            metadata: { pageNumber: i + 1 },
          });
        }
      }
    }

    return { filename, chunks, pageCount };
  },
};
