import { POST } from "./route";
import type { NextRequest } from "next/server";
import { streamText } from "ai";

// Mock dependencies
jest.mock("@/core/lib/actions/resources", () => ({
  createResource: jest.fn(),
}));
jest.mock("@/core/lib/ai/embedding", () => ({
  findRelevantContent: jest.fn(),
}));
jest.mock("@/core/lib/ai/providers", () => ({
  getChatModel: jest.fn(() => "mock-model"),
}));
jest.mock("@/core/lib/rate-limit", () => ({
  rateLimit: jest.fn(() => ({ allowed: true })),
}));
jest.mock("ai", () => ({
  streamText: jest.fn(),
  generateText: jest.fn(),
  tool: jest.fn((def: unknown) => def),
  convertToModelMessages: jest.fn(async (msgs: unknown) => msgs),
  stepCountIs: jest.fn((n: number) => n),
  createIdGenerator: jest.fn(() => jest.fn()),
}));
jest.mock("@/server/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => [{ messages: [] }]),
        })),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(),
      })),
    })),
  },
}));
jest.mock("@/server/db/schema", () => ({
  chats: { id: "id", messages: "messages", userId: "user_id", title: "title" },
}));

const mockedStreamText = streamText as jest.MockedFunction<typeof streamText>;

/** Minimal mock headers for NextRequest */
const mockHeaders = { get: jest.fn(() => "127.0.0.1") };

describe("/api/chat POST", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for invalid JSON", async () => {
    const req = {
      headers: mockHeaders,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: boolean; message: string };
    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Invalid JSON/);
  });

  it("returns 400 for missing message or id", async () => {
    const req = { headers: mockHeaders, json: async () => ({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: boolean; message: string };
    expect(data.error).toBe(true);
    expect(data.message).toMatch(/message/);
  });

  it("returns 500 for streamText error", async () => {
    mockedStreamText.mockImplementation(() => {
      throw new Error("LLM error");
    });
    const req = {
      headers: mockHeaders,
      json: async () => ({
        message: {
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "hi" }],
        },
        id: "chat-1",
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: boolean; message: string };
    expect(data.error).toBe(true);
    expect(data.message).toMatch(/LLM error/);
  });

  it("returns 500 for toUIMessageStreamResponse error", async () => {
    mockedStreamText.mockImplementation(
      () =>
        ({
          consumeStream: jest.fn(),
          toUIMessageStreamResponse: () => {
            throw new Error("Stream error");
          },
        }) as unknown as ReturnType<typeof streamText>,
    );
    const req = {
      headers: mockHeaders,
      json: async () => ({
        message: {
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "hi" }],
        },
        id: "chat-1",
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: boolean; message: string };
    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Stream error/);
  });

  it("calls toUIMessageStreamResponse on success", async () => {
    const mockToUIMessageStreamResponse = jest.fn(() => "streamed!");
    mockedStreamText.mockImplementation(
      () =>
        ({
          consumeStream: jest.fn(),
          toUIMessageStreamResponse: mockToUIMessageStreamResponse,
        }) as unknown as ReturnType<typeof streamText>,
    );
    const req = {
      headers: mockHeaders,
      json: async () => ({
        message: {
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "hi" }],
        },
        id: "chat-1",
      }),
    } as unknown as NextRequest;
    await POST(req);
    expect(mockToUIMessageStreamResponse).toHaveBeenCalled();
  });
});
