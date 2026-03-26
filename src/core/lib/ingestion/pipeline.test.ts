import { ingestDocument } from "./pipeline";
import type { ExtractedDocument } from "./types";

// Mock the database
const mockInsertValues = jest.fn();
jest.mock("@/server/db", () => ({
  db: {
    insert: jest.fn(() => ({
      values: (...args: unknown[]) => mockInsertValues(...args),
    })),
  },
}));

jest.mock("@/server/db/schema", () => ({
  resources: "resources_table",
  embeddings: "embeddings_table",
}));

// Mock nanoid
jest.mock("@/core/lib/utils", () => ({
  nanoid: jest.fn(() => "test-id-123"),
}));

// Mock embedding generation
const mockGenerateEmbeddings = jest.fn();
jest.mock("@/core/lib/ai/embedding", () => ({
  generateEmbeddings: (...args: unknown[]) => mockGenerateEmbeddings(...args),
}));

// Mock vector config
jest.mock("@/config/vector.config", () => ({
  vectorConfig: {
    ingestion: {
      maxChunksPerBatch: 2,
      embeddingTimeout: 5000,
    },
  },
}));

describe("ingestDocument", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsertValues.mockResolvedValue(undefined);
  });

  it("creates a resource and generates embeddings for chunks", async () => {
    mockGenerateEmbeddings.mockResolvedValue([
      { content: "chunk 1 text", embedding: [0.1, 0.2] },
      { content: "chunk 2 text", embedding: [0.3, 0.4] },
    ]);

    const doc: ExtractedDocument = {
      filename: "test.pdf",
      chunks: [{ content: "chunk 1 text" }, { content: "chunk 2 text" }],
    };

    const result = await ingestDocument(doc);

    expect(result.filename).toBe("test.pdf");
    expect(result.chunksProcessed).toBe(2);
    expect(result.embeddingsCount).toBe(2);
    expect(result.resourceId).toBe("test-id-123");
  });

  it("skips empty chunks", async () => {
    mockGenerateEmbeddings.mockResolvedValue([
      { content: "valid text", embedding: [0.1] },
    ]);

    const doc: ExtractedDocument = {
      filename: "test.md",
      chunks: [{ content: "valid text" }, { content: "   " }, { content: "" }],
    };

    const result = await ingestDocument(doc);

    expect(result.chunksProcessed).toBe(1);
    expect(result.embeddingsCount).toBe(1);
  });

  it("processes chunks in batches", async () => {
    // maxChunksPerBatch is 2 in our mock config
    mockGenerateEmbeddings
      .mockResolvedValueOnce([
        { content: "chunk 1", embedding: [0.1] },
        { content: "chunk 2", embedding: [0.2] },
      ])
      .mockResolvedValueOnce([{ content: "chunk 3", embedding: [0.3] }]);

    const doc: ExtractedDocument = {
      filename: "large.pdf",
      chunks: [
        { content: "chunk 1" },
        { content: "chunk 2" },
        { content: "chunk 3" },
      ],
    };

    const result = await ingestDocument(doc);

    expect(mockGenerateEmbeddings).toHaveBeenCalledTimes(2);
    expect(result.embeddingsCount).toBe(3);
  });

  it("continues on embedding batch failure", async () => {
    mockGenerateEmbeddings
      .mockRejectedValueOnce(new Error("Embedding API error"))
      .mockResolvedValueOnce([{ content: "chunk 3", embedding: [0.3] }]);

    const doc: ExtractedDocument = {
      filename: "partial.pdf",
      chunks: [
        { content: "chunk 1" },
        { content: "chunk 2" },
        { content: "chunk 3" },
      ],
    };

    const result = await ingestDocument(doc);

    // First batch of 2 failed, second batch of 1 succeeded
    expect(result.embeddingsCount).toBe(1);
    expect(result.chunksProcessed).toBe(3);
  });

  it("handles timeout errors gracefully", async () => {
    // Simulate a timeout by making the embedding function take longer than the configured timeout
    mockGenerateEmbeddings.mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Embedding generation timeout")),
            10,
          );
        }),
    );

    const doc: ExtractedDocument = {
      filename: "slow.pdf",
      chunks: [{ content: "slow chunk" }],
    };

    const result = await ingestDocument(doc);

    // Should still complete, just with 0 embeddings
    expect(result.filename).toBe("slow.pdf");
    expect(result.embeddingsCount).toBe(0);
  });

  it("returns correct result for empty document", async () => {
    const doc: ExtractedDocument = {
      filename: "empty.txt",
      chunks: [],
    };

    const result = await ingestDocument(doc);

    expect(result.filename).toBe("empty.txt");
    expect(result.chunksProcessed).toBe(0);
    expect(result.embeddingsCount).toBe(0);
    expect(mockGenerateEmbeddings).not.toHaveBeenCalled();
  });
});
