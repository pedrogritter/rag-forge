import { sql } from "drizzle-orm";
import { text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

import { nanoid } from "@/core/lib/utils";
import { pgTableCreator } from "drizzle-orm/pg-core";
export const createTable = pgTableCreator((name) => `ragforge_${name}`);

export const resources = createTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text("content").notNull(),
  type: varchar("type", { length: 10 }).notNull().default("text"),
  filename: varchar("filename", { length: 255 }),
  fileHash: varchar("file_hash", { length: 64 }),
  pageCount: integer("page_count"),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = z.object({
  content: z.string().min(1),
});

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;
