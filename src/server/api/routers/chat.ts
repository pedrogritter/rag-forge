// import { z } from "zod";

// import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
// import { chats } from "@/server/db/schema";
// import { sql } from "drizzle-orm";

// export const chatRouter = createTRPCRouter({
//   hello: publicProcedure
//     .input(z.object({ text: z.string() }))
//     .query(({ input }) => {
//       return {
//         greeting: `Hello ${input.text}`,
//       };
//     }),

//   create: publicProcedure
//     .input(z.object({ name: z.string().min(1) }))
//     .mutation(async ({ ctx, input }) => {
//       await ctx.db.insert(chats).values({
//         name: input.name,
//       });
//     }),

//   getLatest: publicProcedure.query(async ({ ctx }) => {
//     const chat = await ctx.db
//       .select()
//       .from(chats)
//       .orderBy(sql`${chats.createdAt} DESC`)
//       .limit(1);
//     return chat[0] ?? null;
//   }),
// });
