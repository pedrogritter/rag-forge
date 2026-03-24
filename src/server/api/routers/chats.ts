import { z } from "zod";
import { eq, desc, lt, and } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { chats } from "@/server/db/schema";

/** Default number of chats per page. */
const DEFAULT_LIMIT = 25;

export const chatsRouter = createTRPCRouter({
  /** List chats for a user with cursor-based pagination, most recent first. */
  list: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, cursor, limit } = input;

      const conditions = cursor
        ? and(eq(chats.userId, userId), lt(chats.updatedAt, new Date(cursor)))
        : eq(chats.userId, userId);

      const items = await ctx.db
        .select({
          id: chats.id,
          title: chats.title,
          createdAt: chats.createdAt,
          updatedAt: chats.updatedAt,
        })
        .from(chats)
        .where(conditions)
        .orderBy(desc(chats.updatedAt))
        .limit(limit + 1);

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const next = items.pop()!;
        nextCursor = next.updatedAt.toISOString();
      }

      return { items, nextCursor };
    }),

  /** Get a single chat by ID (with messages). */
  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [chat] = await ctx.db
        .select()
        .from(chats)
        .where(eq(chats.id, input.id))
        .limit(1);
      return chat ?? null;
    }),

  /** Create a new empty chat. Returns the new chat ID. */
  create: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [chat] = await ctx.db
        .insert(chats)
        .values({ userId: input.userId })
        .returning({ id: chats.id });
      return chat!;
    }),

  /** Update a chat's title. */
  updateTitle: publicProcedure
    .input(z.object({ id: z.string().min(1), title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(chats)
        .set({ title: input.title })
        .where(eq(chats.id, input.id));
    }),

  /** Delete a chat by ID. */
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(chats).where(eq(chats.id, input.id));
    }),
});
