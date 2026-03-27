import {
  generateEmbedding,
  generateEmbeddings,
  findRelevantContent,
} from "./embedding";
import { embed, embedMany } from "ai";

// Mock AI SDK embedding functions
jest.mock("ai", () => ({
  embed: jest.fn(),
  embedMany: jest.fn(),
}));

// Mock providers
jest.mock("@/core/lib/ai/providers", () => ({
  getEmbeddingModel: jest.fn(() => "mock-embedding-model"),
}));

// Mock config
jest.mock("@/config/vector.config", () => ({
  vectorConfig: {
    embedding: { model: "text-embedding-3-small", dimensions: 512 },
    search: {
      similarityThreshold: 0.3,
      topK: 10,
      keywordWeight: 0.3,
      vectorWeight: 0.7,
    },
  },
}));

// Mock database
const mockDbSelect = jest.fn();
jest.mock("@/server/db", () => ({
  db: {
    select: (...args: unknown[]) => mockDbSelect(...args),
  },
}));

jest.mock("@/server/db/schema/embeddings", () => ({
  embeddings: {
    id: "id",
    resourceId: "resource_id",
    content: "content",
    embedding: "embedding",
    searchVector: "search_vector",
    pageNumber: "page_number",
    pageTitle: "page_title",
  },
}));

jest.mock("@/server/db/schema/resources", () => ({
  resources: {
    id: "id",
    filename: "filename",
  },
  createTable: jest.fn(),
}));

const mockedEmbed = embed as jest.MockedFunction<typeof embed>;
const mockedEmbedMany = embedMany as jest.MockedFunction<typeof embedMany>;

describe("generateEmbedding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates a single embedding for a string", async () => {
    const fakeEmbedding = [0.1, 0.2, 0.3];
    mockedEmbed.mockResolvedValue({
      embedding: fakeEmbedding,
    } as Awaited<ReturnType<typeof embed>>);

    const result = await generateEmbedding("Hello world");

    expect(result).toEqual(fakeEmbedding);
    expect(mockedEmbed).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "Hello world",
      }),
    );
  });

  it("replaces newlines with spaces before embedding", async () => {
    mockedEmbed.mockResolvedValue({
      embedding: [0.1],
    } as Awaited<ReturnType<typeof embed>>);

    await generateEmbedding("line1\nline2\nline3");

    expect(mockedEmbed).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "line1 line2 line3",
      }),
    );
  });
});

describe("generateEmbeddings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates embeddings for a single string", async () => {
    mockedEmbedMany.mockResolvedValue({
      embeddings: [[0.1, 0.2]],
    } as Awaited<ReturnType<typeof embedMany>>);

    const result = await generateEmbeddings("single text");

    expect(result).toEqual([{ content: "single text", embedding: [0.1, 0.2] }]);
  });

  it("generates embeddings for multiple strings", async () => {
    mockedEmbedMany.mockResolvedValue({
      embeddings: [
        [0.1, 0.2],
        [0.3, 0.4],
      ],
    } as Awaited<ReturnType<typeof embedMany>>);

    const result = await generateEmbeddings(["text A", "text B"]);

    expect(result).toEqual([
      { content: "text A", embedding: [0.1, 0.2] },
      { content: "text B", embedding: [0.3, 0.4] },
    ]);
    expect(mockedEmbedMany).toHaveBeenCalledWith(
      expect.objectContaining({
        values: ["text A", "text B"],
      }),
    );
  });

  it("maps content correctly even if values array has undefineds", async () => {
    mockedEmbedMany.mockResolvedValue({
      embeddings: [[0.5]],
    } as Awaited<ReturnType<typeof embedMany>>);

    const result = await generateEmbeddings("only one");
    expect(result[0]!.content).toBe("only one");
  });
});

describe("findRelevantContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedEmbed.mockResolvedValue({
      embedding: new Array(512).fill(0),
    } as Awaited<ReturnType<typeof embed>>);
  });

  it("returns RRF-fused results from vector and keyword search", async () => {
    // Mock parallel query (Promise.all with two db.select calls)
    const vectorResults = [
      {
        id: "e1",
        content: "Vector result 1",
        score: 0.9,
        filename: "doc.pdf",
        pageNumber: 1,
        pageTitle: "Intro",
      },
      {
        id: "e2",
        content: "Vector result 2",
        score: 0.7,
        filename: null,
        pageNumber: null,
        pageTitle: null,
      },
    ];
    const keywordResults = [
      {
        id: "e1",
        content: "Vector result 1",
        score: 5.0,
        filename: "doc.pdf",
        pageNumber: 1,
        pageTitle: "Intro",
      },
      {
        id: "e3",
        content: "Keyword only",
        score: 3.0,
        filename: "notes.md",
        pageNumber: null,
        pageTitle: null,
      },
    ];

    // Both queries use chained select().from().innerJoin()...
    const createChain = (results: unknown[]) => ({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve(results)),
            })),
          })),
        })),
      })),
    });

    let callCount = 0;
    mockDbSelect.mockImplementation(() => {
      callCount++;
      return createChain(callCount === 1 ? vectorResults : keywordResults);
    });

    const result = await findRelevantContent("test query");

    // Should have 3 unique results (e1 appears in both, fused)
    expect(result).toHaveLength(3);

    // e1 should have highest score (appears in both vector + keyword)
    const e1 = result.find((r) => r.content === "Vector result 1");
    expect(e1).toBeDefined();
    expect(e1!.similarity).toBeGreaterThan(0);
    expect(e1!.resourceName).toBe("doc.pdf");
    expect(e1!.pageNumber).toBe(1);
    expect(e1!.pageTitle).toBe("Intro");
  });

  it("returns empty array when no results match", async () => {
    const createChain = () => ({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve([])),
            })),
          })),
        })),
      })),
    });

    mockDbSelect.mockImplementation(() => createChain());

    const result = await findRelevantContent("no matches");
    expect(result).toEqual([]);
  });

  it("includes PDF metadata when available", async () => {
    const vectorResults = [
      {
        id: "e1",
        content: "Some PDF chunk",
        score: 0.8,
        filename: "manual.pdf",
        pageNumber: 12,
        pageTitle: "Installation",
      },
    ];

    const createChain = (results: unknown[]) => ({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve(results)),
            })),
          })),
        })),
      })),
    });

    let callCount = 0;
    mockDbSelect.mockImplementation(() => {
      callCount++;
      return createChain(callCount === 1 ? vectorResults : []);
    });

    const result = await findRelevantContent("installation guide");
    expect(result[0]!.resourceName).toBe("manual.pdf");
    expect(result[0]!.pageNumber).toBe(12);
    expect(result[0]!.pageTitle).toBe("Installation");
  });

  it("converts null metadata to undefined", async () => {
    const vectorResults = [
      {
        id: "e1",
        content: "text chunk",
        score: 0.5,
        filename: null,
        pageNumber: null,
        pageTitle: null,
      },
    ];

    const createChain = (results: unknown[]) => ({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve(results)),
            })),
          })),
        })),
      })),
    });

    let callCount = 0;
    mockDbSelect.mockImplementation(() => {
      callCount++;
      return createChain(callCount === 1 ? vectorResults : []);
    });

    const result = await findRelevantContent("text");
    expect(result[0]!.resourceName).toBeUndefined();
    expect(result[0]!.pageNumber).toBeUndefined();
    expect(result[0]!.pageTitle).toBeUndefined();
  });
});
