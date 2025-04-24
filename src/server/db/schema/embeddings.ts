import { sql } from "drizzle-orm";
import { text, timestamp, varchar, customType } from "drizzle-orm/pg-core";
import { z } from "zod";

import { nanoid } from "@/core/lib/utils";
import { resources } from "./resources";
import { createTable } from "./resources";

export const VECTOR_DIMENSIONS = 1536;

// Create a custom type for vector
export const vector = customType<{ data: number[] }>({
  dataType() {
    return `vector(${VECTOR_DIMENSIONS})`;
  },
});

export const embeddings = createTable("embeddings", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  resourceId: varchar("resource_id", { length: 191 })
    .notNull()
    .references(() => resources.id),
  content: text("content").notNull(),
  embedding: vector("embedding"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for embeddings - used to validate API requests
export const insertEmbeddingSchema = z.object({
  resourceId: z.string().min(1),
  content: z.string().min(1),
  embedding: z.array(z.number()).length(VECTOR_DIMENSIONS),
});

// Type for embeddings - used to type API request params and within Components
export type NewEmbeddingParams = z.infer<typeof insertEmbeddingSchema>;
