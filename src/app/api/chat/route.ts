import { agentConfig, modelConfig } from "@/config";
import { createResource } from "@/core/lib/actions/resources";
import { findRelevantContent } from "@/core/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import {
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import { z } from "zod/v3";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    let body: { messages?: unknown };
    try {
      body = (await req.json()) as { messages?: unknown };
    } catch (jsonErr) {
      console.error("Invalid JSON in request:", jsonErr);
      return NextResponse.json(
        {
          error: true,
          message: String(jsonErr) ?? "Invalid JSON in request body.",
        },
        { status: 400 },
      );
    }

    const { messages: rawMessages } = body;
    if (!rawMessages || !Array.isArray(rawMessages)) {
      return NextResponse.json(
        {
          error: true,
          message: "Missing or invalid 'messages' array in request.",
        },
        { status: 400 },
      );
    }

    const allowStorage = modelConfig.tools.useStoreRelevantTool;

    const tools = {
      ...(allowStorage && {
        addResource: tool({
          description: `Add a resource to your knowledge base. If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
          inputSchema: z.object({
            content: z
              .string()
              .describe("the content or resource to add to the knowledge base"),
          }),
          execute: async ({ content }) => createResource({ content }),
        }),
      }),
      getInformation: tool({
        description: `Get information from your knowledge base to answer questions`,
        inputSchema: z.object({
          question: z
            .string()
            .describe(
              "The user's question that needs knowledge based information",
            ),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    };

    const messages = await convertToModelMessages(
      rawMessages as UIMessage[],
    );

    let result;
    try {
      result = streamText({
        model: openai(modelConfig.model),
        messages,
        temperature: modelConfig.temperature,
        system: agentConfig.systemPrompt,
        tools,
        stopWhen: stepCountIs(3),
      });
    } catch (llmErr) {
      console.error("streamText error:", llmErr);
      return NextResponse.json(
        {
          error: true,
          message: String(llmErr) ?? "Failed to start LLM stream.",
        },
        { status: 500 },
      );
    }

    try {
      return result.toUIMessageStreamResponse();
    } catch (streamErr) {
      console.error("Data stream response error:", streamErr);
      return NextResponse.json(
        {
          error: true,
          message: String(streamErr) ?? "Failed to stream response.",
        },
        { status: 500 },
      );
    }
  } catch (error: unknown) {
    // Log error for debugging
    console.error("LLM API call error:", error);
    return NextResponse.json(
      { error: true, message: String(error) ?? "Internal server error." },
      { status: 500 },
    );
  }
}
