import { POST } from "./route";
import { NextRequest } from "next/server";

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
  tool: jest.fn((def) => def),
}));

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
    const { streamText } = require("ai");
    streamText.mockImplementation(() => {
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
    const { streamText } = require("ai");
    streamText.mockImplementation(() => ({
      toDataStreamResponse: () => {
        throw new Error("Stream error");
      },
    }));
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
    const { streamText } = require("ai");
    streamText.mockImplementation(() => ({
      toDataStreamResponse: mockToDataStreamResponse,
    }));
    const req = {
      json: async () => ({ messages: [] }),
    } as unknown as NextRequest;
    await POST(req);
    expect(mockToDataStreamResponse).toHaveBeenCalled();
  });
});
