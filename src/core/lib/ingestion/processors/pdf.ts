import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { chunkText } from "../chunking";
import { vectorConfig } from "@/config/vector.config";
import type {
  DocumentProcessor,
  ExtractedDocument,
  DocumentChunk,
} from "../types";

interface PDFPage {
  lines?: string[];
  text?: string;
  title?: string;
  [key: string]: unknown;
}

const { maxPageSize } = vectorConfig.ingestion;

export const pdfProcessor: DocumentProcessor = {
  supportedExtensions: [".pdf"],

  async extract(buffer: Buffer, filename: string): Promise<ExtractedDocument> {
    // Dynamic import to avoid build-time module resolution issues with Turbopack
    const { readPdfText } = await import("pdf-text-reader");

    // pdf-text-reader requires a file path, so write buffer to a temp file.
    const tmpPath = join("/tmp", `ragforge-${randomUUID()}.pdf`);

    try {
      await writeFile(tmpPath, buffer);
      const pdfPages = (await readPdfText(tmpPath)) as PDFPage[];

      const chunks: DocumentChunk[] = [];
      let pageCount = 0;

      for (let i = 0; i < pdfPages.length; i++) {
        const page = pdfPages[i];
        const rawContent = page?.lines
          ? page.lines.join(" ")
          : (page?.text ?? "");
        const content = rawContent
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
                (_, j) =>
                  content.slice(j * maxPageSize, (j + 1) * maxPageSize),
              )
            : [content];

        for (const section of sections) {
          const textChunks = chunkText(section);
          for (const text of textChunks) {
            chunks.push({
              content: text,
              metadata: {
                pageNumber: i + 1,
                pageTitle: page?.title ?? undefined,
              },
            });
          }
        }
      }

      return { filename, chunks, pageCount };
    } finally {
      await unlink(tmpPath).catch(() => undefined);
    }
  },
};
