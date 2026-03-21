import { sql } from "drizzle-orm";
import {
  text,
  timestamp,
  varchar,
  customType,
  index,
} from "drizzle-orm/pg-core";
import { z } from "zod";

import { nanoid } from "@/core/lib/utils";
import { resources } from "./resources";
import { createTable } from "./resources";
import { vectorConfig } from "@/config/vector.config";

export const VECTOR_DIMENSIONS = vectorConfig.embedding.dimensions;

// Create a custom type for vector
export const vector = customType<{ data: number[] }>({
  dataType() {
    return `vector(${VECTOR_DIMENSIONS})`;
  },
});

// Create a custom type for tsvector (full-text search)
export const tsvectorType = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const embeddings = createTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 })
      .notNull()
      .references(() => resources.id),
    content: text("content").notNull(),
    embedding: vector("embedding"),
    searchVector: tsvectorType("search_vector"),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("embeddings_search_vector_idx").using("gin", table.searchVector),
    index("embeddings_vector_hnsw_idx").using(
      "hnsw",
      sql`${table.embedding} vector_cosine_ops`,
    ),
  ],
);

// Schema for embeddings - used to validate API requests
export const insertEmbeddingSchema = z.object({
  resourceId: z.string().min(1),
  content: z.string().min(1),
  embedding: z.array(z.number()).length(VECTOR_DIMENSIONS),
});

// Type for embeddings - used to type API request params and within Components
export type NewEmbeddingParams = z.infer<typeof insertEmbeddingSchema>;
