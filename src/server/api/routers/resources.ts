import { z } from "zod";
import { eq, sql, count, desc } from "drizzle-orm";
import { generateText } from "ai";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  embeddings,
  resources,
} from "@/server/db/schema";
import { getChatModel } from "@/core/lib/ai/providers";
import { STATIC_TIPS } from "@/config/assistant.config";

// Simple in-memory cache for topic suggestions (5-minute TTL)
let cachedTopics: { data: string[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Extract a JSON array from LLM text that may be wrapped in markdown fences. */
function extractJsonArray(text: string): string[] | null {
  // Strip markdown code fences if present
  const stripped = text
    .replace(/```(?:json)?\s*/g, "")
    .replace(/```/g, "")
    .trim();
  try {
    const parsed = z.array(z.string()).parse(JSON.parse(stripped));
    return parsed.slice(0, 4);
  } catch {
    return null;
  }
}

export const resourcesRouter = createTRPCRouter({
  /** List all resources with metadata (filename, page count, chunk count). */
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: resources.id,
        content: resources.content,
        createdAt: resources.createdAt,
        type: resources.type,
        filename: resources.filename,
        pageCount: resources.pageCount,
      })
      .from(resources)
      .orderBy(desc(resources.createdAt));

    // Get embedding counts per resource in a single query
    const chunkCounts = await ctx.db
      .select({
        resourceId: embeddings.resourceId,
        count: count(),
      })
      .from(embeddings)
      .groupBy(embeddings.resourceId);

    const countMap = new Map(chunkCounts.map((c) => [c.resourceId, c.count]));

    return rows.map((row) => ({
      id: row.id,
      name: row.filename ?? row.content.slice(0, 50),
      type: (row.type ?? "text") as "pdf" | "text",
      pageCount: row.pageCount,
      chunksCount: countMap.get(row.id) ?? 0,
      createdAt: row.createdAt,
    }));
  }),

  /** Get full detail for a single resource — content preview + chunk list. */
  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [resource] = await ctx.db
        .select()
        .from(resources)
        .where(eq(resources.id, input.id))
        .limit(1);

      if (!resource) return null;

      // All chunks with page metadata
      const chunks = await ctx.db
        .select({
          id: embeddings.id,
          content: embeddings.content,
          pageNumber: embeddings.pageNumber,
          pageTitle: embeddings.pageTitle,
        })
        .from(embeddings)
        .where(eq(embeddings.resourceId, input.id))
        .orderBy(embeddings.pageNumber);

      return {
        id: resource.id,
        content: resource.content,
        createdAt: resource.createdAt,
        filename: resource.filename ?? null,
        pageCount: resource.pageCount ?? null,
        chunks,
      };
    }),

  /** Delete a resource and all related data. */
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        // 1. Delete embeddings for this resource
        await tx.delete(embeddings).where(eq(embeddings.resourceId, input.id));

        // 2. Delete the resource itself
        await tx.delete(resources).where(eq(resources.id, input.id));
      });
    }),

  /**
   * Sample random embeddings from the knowledge base and generate
   * 4 example questions a user might ask. Results are cached for 5 minutes.
   */
  sampleTopics: publicProcedure.query(async ({ ctx }) => {
    // Return cached if still valid
    if (cachedTopics && Date.now() < cachedTopics.expiresAt) {
      return cachedTopics.data;
    }

    // Check if any embeddings exist
    const samples = await ctx.db
      .select({ content: embeddings.content })
      .from(embeddings)
      .orderBy(sql`RANDOM()`)
      .limit(10);

    // If no resources indexed, return static tips
    if (samples.length === 0) {
      return STATIC_TIPS;
    }

    try {
      const excerpts = samples
        .map((s, i) => `${i + 1}. ${s.content.slice(0, 300)}`)
        .join("\n");

      const { text } = await generateText({
        model: getChatModel(),
        maxOutputTokens: 200,
        temperature: 0.7,
        prompt: `Given these knowledge base excerpts, generate exactly 4 short example questions a user might ask. Return ONLY a JSON array of strings, no other text.\n\nExcerpts:\n${excerpts}`,
      });

      const topics = extractJsonArray(text);
      if (topics && topics.length > 0) {
        cachedTopics = { data: topics, expiresAt: Date.now() + CACHE_TTL_MS };
        return topics;
      }
    } catch {
      // LLM call failed — fall through to static tips
    }

    return STATIC_TIPS;
  }),
});
