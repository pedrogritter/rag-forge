import { chunkMarkdown, chunkText } from "../chunking";
import type {
  DocumentProcessor,
  ExtractedDocument,
  DocumentChunk,
} from "../types";

export const textProcessor: DocumentProcessor = {
  supportedExtensions: [".md", ".mdx", ".txt", ".text"],

  async extract(buffer: Buffer, filename: string): Promise<ExtractedDocument> {
    const content = buffer.toString("utf-8").trim();
    if (content.length === 0) {
      return { filename, chunks: [] };
    }

    const isMarkdown = /\.mdx?$/.test(filename);
    const textChunks = isMarkdown
      ? chunkMarkdown(content)
      : chunkText(content);

    const chunks: DocumentChunk[] = textChunks.map((text) => ({
      content: text,
    }));

    return { filename, chunks };
  },
};
