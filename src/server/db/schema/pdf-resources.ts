import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { nanoid } from "@/core/lib/utils";
import { resources } from "./resources";
import { embeddings } from "./embeddings";
import { createTable } from "./resources";

// Table for tracking PDF files
export const pdfResources = createTable("pdf_resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  resourceId: varchar("resource_id", { length: 191 })
    .notNull()
    .references(() => resources.id),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileHash: varchar("file_hash", { length: 64 }).notNull(),
  pageCount: integer("page_count"),
  lastProcessedAt: timestamp("last_processed_at")
    .notNull()
    .default(sql`now()`),
});

// Table for tracking PDF-specific embedding metadata
export const pdfEmbeddings = createTable("pdf_embeddings", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  embeddingId: varchar("embedding_id", { length: 191 })
    .notNull()
    .references(() => embeddings.id),
  pageNumber: integer("page_number"),
  pageTitle: text("page_title"),
});
