import { createResource } from "@/core/lib/actions/resources";
import { findRelevantContent } from "@/core/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    temperature: 0.3,
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
        Only respond to questions using information from tool calls.
        If no relevant information is found in the tool calls, respond, "Sorry, I don't know, the question is outside of my knowledge boundary."`,
    tools: {
      addResource: tool({
        description: `Add a resource to your knowledge base. If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe("the content or resource to add to the knowledge base"),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `Get information from your knowledge base to answer questions`,
        parameters: z.object({
          question: z
            .string()
            .describe(
              "The user's question that needs knowledge based information",
            ),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  return result.toDataStreamResponse();
}
