import { sql } from "drizzle-orm";
import { jsonb, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { nanoid } from "@/core/lib/utils";
import { createTable } from "./resources";

/**
 * Stores chat conversations. Messages are stored as UIMessage[] JSONB,
 * following the AI SDK recommendation for chatbot persistence:
 * https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence
 */
export const chats = createTable("chats", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title"),
  // Store the full UIMessage[] array as JSONB — the AI SDK's recommended format
  messages: jsonb("messages").$type<unknown[]>().notNull().default([]),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});
