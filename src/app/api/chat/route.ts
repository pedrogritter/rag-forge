import { assistantConfig, modelConfig } from "@/config";
import { createResource } from "@/core/lib/actions/resources";
import { findRelevantContent } from "@/core/lib/ai/embedding";
import { getChatModel } from "@/core/lib/ai/providers";
import { rateLimit } from "@/core/lib/rate-limit";
import {
  type UIMessage,
  convertToModelMessages,
  createIdGenerator,
  generateText,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import { z } from "zod/v3";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { chats } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const maxDuration = 30;

/** Max chat requests per IP per minute. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

/** Load previous messages for a chat from the database. */
async function loadChat(chatId: string): Promise<UIMessage[]> {
  const [chat] = await db
    .select({ messages: chats.messages })
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);
  return (chat?.messages as UIMessage[]) ?? [];
}

/** Save the full UIMessage[] array to the database. */
async function saveChat(chatId: string, messages: UIMessage[]): Promise<void> {
  await db
    .update(chats)
    .set({ messages: messages as unknown[], updatedAt: new Date() })
    .where(eq(chats.id, chatId));
}

/** Generate a short title for the chat based on the first exchange. */
async function generateChatTitle(
  userMessage: string,
  assistantMessage: string,
): Promise<string> {
  const { text } = await generateText({
    model: getChatModel(),
    system:
      "Generate a concise title (3-6 words) for this conversation. Return only the title, no quotes or punctuation.",
    prompt: `User: ${userMessage}\nAssistant: ${assistantMessage}`,
    temperature: 0.5,
  });
  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (by IP)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: true,
          message: "Too many requests. Please try again shortly.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
        },
      );
    }

    let body: {
      message?: unknown;
      id?: unknown;
      systemPrompt?: unknown;
      temperature?: unknown;
      provider?: unknown;
      model?: unknown;
    };
    try {
      body = (await req.json()) as typeof body;
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

    const { message: rawMessage, id: chatId } = body;
    if (!rawMessage || typeof chatId !== "string") {
      return NextResponse.json(
        {
          error: true,
          message: "Missing 'message' or 'id' in request body.",
        },
        { status: 400 },
      );
    }

    // Extract optional client-side overrides
    const customSystemPrompt =
      typeof body.systemPrompt === "string"
        ? body.systemPrompt.slice(0, 2000)
        : "";
    const customTemperature =
      typeof body.temperature === "number" &&
      body.temperature >= 0 &&
      body.temperature <= 1
        ? body.temperature
        : undefined;
    const customProvider =
      typeof body.provider === "string" ? body.provider : undefined;
    const customModel =
      typeof body.model === "string" ? body.model : undefined;

    // Load previous messages from DB and append the new message
    const previousMessages = await loadChat(chatId);
    const messages = [...previousMessages, rawMessage as UIMessage];

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

    const modelMessages = await convertToModelMessages(messages);

    let result;
    try {
      result = streamText({
        model: getChatModel(customProvider, customModel),
        messages: modelMessages,
        temperature: customTemperature ?? modelConfig.temperature,
        maxOutputTokens: modelConfig.maxTokens ?? 2048,
        system: customSystemPrompt || assistantConfig.systemPrompt,
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

    // Consume the stream to ensure onFinish fires even if client disconnects
    result.consumeStream();

    try {
      return result.toUIMessageStreamResponse({
        originalMessages: messages,
        generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
        onFinish: async ({ messages: finalMessages }) => {
          await saveChat(chatId, finalMessages);

          // Auto-generate title after the first exchange (2 messages = 1 user + 1 assistant)
          if (finalMessages.length === 2) {
            const userMsg = finalMessages.find((m) => m.role === "user");
            const assistantMsg = finalMessages.find(
              (m) => m.role === "assistant",
            );
            if (userMsg && assistantMsg) {
              const userText = userMsg.parts
                .filter(
                  (p): p is { type: "text"; text: string } => p.type === "text",
                )
                .map((p) => p.text)
                .join("");
              const assistantText = assistantMsg.parts
                .filter(
                  (p): p is { type: "text"; text: string } => p.type === "text",
                )
                .map((p) => p.text)
                .join("");
              try {
                const title = await generateChatTitle(userText, assistantText);
                await db
                  .update(chats)
                  .set({ title })
                  .where(
                    sql`${chats.id} = ${chatId} AND ${chats.title} IS NULL`,
                  );
              } catch {
                // Title generation is best-effort; don't fail the chat
              }
            }
          }
        },
      });
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
    console.error("LLM API call error:", error);
    return NextResponse.json(
      { error: true, message: String(error) ?? "Internal server error." },
      { status: 500 },
    );
  }
}
