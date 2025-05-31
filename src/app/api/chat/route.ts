import { agentConfig, modelConfig } from "@/config";
import { createResource } from "@/core/lib/actions/resources";
import { findRelevantContent } from "@/core/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (jsonErr) {
      console.error("Invalid JSON in request:", jsonErr);
      return NextResponse.json(
        {
          error: true,
          message: String(jsonErr) || "Invalid JSON in request body.",
        },
        { status: 400 },
      );
    }

    const { messages } = body || {};
    if (!messages || !Array.isArray(messages)) {
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
          parameters: z.object({
            content: z
              .string()
              .describe("the content or resource to add to the knowledge base"),
          }),
          execute: async ({ content }) => createResource({ content }),
        }),
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
    };

    let result;
    try {
      result = streamText({
        model: openai(modelConfig.model),
        messages,
        temperature: modelConfig.temperature,
        system: agentConfig.systemPrompt,
        tools: tools,
      });
    } catch (llmErr) {
      console.error("streamText error:", llmErr);
      return NextResponse.json(
        {
          error: true,
          message: String(llmErr) || "Failed to start LLM stream.",
        },
        { status: 500 },
      );
    }

    try {
      return result.toDataStreamResponse();
    } catch (streamErr) {
      console.error("Data stream response error:", streamErr);
      return NextResponse.json(
        {
          error: true,
          message: String(streamErr) || "Failed to stream response.",
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    // Log error for debugging
    console.error("LLM API call error:", error);
    return NextResponse.json(
      { error: true, message: String(error) || "Internal server error." },
      { status: 500 },
    );
  }
}
