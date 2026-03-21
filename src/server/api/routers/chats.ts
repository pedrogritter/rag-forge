import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { chats } from "@/server/db/schema";

export const chatsRouter = createTRPCRouter({
  /** List all chats for a user, most recent first. */
  list: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: chats.id,
          title: chats.title,
          createdAt: chats.createdAt,
          updatedAt: chats.updatedAt,
        })
        .from(chats)
        .where(eq(chats.userId, input.userId))
        .orderBy(desc(chats.updatedAt));
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
