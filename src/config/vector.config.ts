export const vectorConfig = {
  embedding: {
    model: "text-embedding-3-small",
    dimensions: 512,
  },
  ingestion: {
    chunkSize: 1000,
    chunkOverlap: 50,
    maxChunksPerBatch: 5,
    maxPageSize: 25000,
    embeddingTimeout: 30000,
    splittingStrategy: "recursive" as const,
  },
  search: {
    similarityThreshold: 0.3,
    topK: 10,
    keywordWeight: 0.3,
    vectorWeight: 0.7,
  },
};
