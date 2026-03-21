/* eslint-disable @typescript-eslint/no-unsafe-call */
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
jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn(),
}));
jest.mock("ai", () => ({
  streamText: jest.fn(),
  tool: jest.fn((def: unknown) => def),
}));

const mockedStreamText = streamText as jest.MockedFunction<typeof streamText>;

describe("/api/chat POST", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for invalid JSON", async () => {
    const req = {
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

  it("returns 400 for missing messages", async () => {
    const req = { json: async () => ({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: boolean; message: string };
    expect(data.error).toBe(true);
    expect(data.message).toMatch(/messages/);
  });

  it("returns 500 for streamText error", async () => {
    mockedStreamText.mockImplementation(() => {
      throw new Error("LLM error");
    });
    const req = {
      json: async () => ({ messages: [] }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: boolean; message: string };
    expect(data.error).toBe(true);
    expect(data.message).toMatch(/LLM error/);
  });

  it("returns 500 for toDataStreamResponse error", async () => {
    mockedStreamText.mockImplementation(
      () =>
        ({
          toDataStreamResponse: () => {
            throw new Error("Stream error");
          },
        }) as unknown as ReturnType<typeof streamText>,
    );
    const req = {
      json: async () => ({ messages: [] }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: boolean; message: string };
    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Stream error/);
  });

  it("calls toDataStreamResponse on success", async () => {
    const mockToDataStreamResponse = jest.fn(() => "streamed!");
    mockedStreamText.mockImplementation(
      () =>
        ({
          toDataStreamResponse: mockToDataStreamResponse,
        }) as unknown as ReturnType<typeof streamText>,
    );
    const req = {
      json: async () => ({ messages: [] }),
    } as unknown as NextRequest;
    await POST(req);
    expect(mockToDataStreamResponse).toHaveBeenCalled();
  });
});
