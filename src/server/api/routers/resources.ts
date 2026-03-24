import { z } from "zod";
import { eq, sql, count, desc } from "drizzle-orm";
import { generateText } from "ai";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  embeddings,
  resources,
  pdfResources,
  pdfEmbeddings,
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
    // Get all resources with optional PDF metadata
    const rows = await ctx.db
      .select({
        id: resources.id,
        content: resources.content,
        createdAt: resources.createdAt,
        filename: pdfResources.filename,
        pageCount: pdfResources.pageCount,
      })
      .from(resources)
      .leftJoin(pdfResources, eq(pdfResources.resourceId, resources.id))
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
      type: row.filename ? "pdf" : ("text" as "pdf" | "text"),
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

      // PDF metadata (if any)
      const [pdf] = await ctx.db
        .select()
        .from(pdfResources)
        .where(eq(pdfResources.resourceId, input.id))
        .limit(1);

      // All chunks with optional page info
      const chunks = await ctx.db
        .select({
          id: embeddings.id,
          content: embeddings.content,
          pageNumber: pdfEmbeddings.pageNumber,
          pageTitle: pdfEmbeddings.pageTitle,
        })
        .from(embeddings)
        .leftJoin(pdfEmbeddings, eq(pdfEmbeddings.embeddingId, embeddings.id))
        .where(eq(embeddings.resourceId, input.id))
        .orderBy(pdfEmbeddings.pageNumber);

      return {
        id: resource.id,
        content: resource.content,
        createdAt: resource.createdAt,
        filename: pdf?.filename ?? null,
        pageCount: pdf?.pageCount ?? null,
        chunks,
      };
    }),

  /** Delete a resource and all related data (embeddings, PDF metadata). */
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        // 1. Get embedding IDs for this resource
        const embeddingRows = await tx
          .select({ id: embeddings.id })
          .from(embeddings)
          .where(eq(embeddings.resourceId, input.id));

        const embeddingIds = embeddingRows.map((e) => e.id);

        // 2. Delete PDF embeddings (references embedding IDs)
        if (embeddingIds.length > 0) {
          for (const embId of embeddingIds) {
            await tx
              .delete(pdfEmbeddings)
              .where(eq(pdfEmbeddings.embeddingId, embId));
          }
        }

        // 3. Delete embeddings for this resource
        await tx.delete(embeddings).where(eq(embeddings.resourceId, input.id));

        // 4. Delete PDF resource metadata
        await tx
          .delete(pdfResources)
          .where(eq(pdfResources.resourceId, input.id));

        // 5. Delete the resource itself
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
