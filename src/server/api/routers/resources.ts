import { z } from "zod";
import { sql } from "drizzle-orm";
import { generateText } from "ai";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { embeddings } from "@/server/db/schema";
import { getChatModel } from "@/core/lib/ai/providers";

// Simple in-memory cache for topic suggestions (5-minute TTL)
let cachedTopics: { data: string[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

const STATIC_TIPS = [
  "What topics are in my knowledge base?",
  "Summarize the key concepts you know about",
  "What questions can you help me with?",
  "Upload a PDF to get started",
];

export const resourcesRouter = createTRPCRouter({
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

    const excerpts = samples
      .map((s, i) => `${i + 1}. ${s.content.slice(0, 300)}`)
      .join("\n");

    const { text } = await generateText({
      model: getChatModel(),
      maxOutputTokens: 200,
      temperature: 0.7,
      prompt: `Given these knowledge base excerpts, generate exactly 4 short example questions a user might ask. Return ONLY a JSON array of strings, no other text.\n\nExcerpts:\n${excerpts}`,
    });

    try {
      const parsed = z.array(z.string()).parse(JSON.parse(text));
      const topics = parsed.slice(0, 4);
      cachedTopics = { data: topics, expiresAt: Date.now() + CACHE_TTL_MS };
      return topics;
    } catch {
      // If LLM output isn't valid JSON, return static tips
      return STATIC_TIPS;
    }
  }),
});
