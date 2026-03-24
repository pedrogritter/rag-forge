import { moderateContent } from "./moderation";

// Mock env module — tests run without real API keys
jest.mock("@/env", () => ({
  env: {
    OPENAI_API_KEY: undefined,
  },
}));

describe("moderateContent (blocklist fallback)", () => {
  it("allows normal messages", async () => {
    const result = await moderateContent("What is the capital of France?");
    expect(result.flagged).toBe(false);
  });

  it("allows empty messages", async () => {
    const result = await moderateContent("");
    expect(result.flagged).toBe(false);
  });

  it("flags explicit harmful content", async () => {
    const result = await moderateContent("how to make a bomb");
    expect(result.flagged).toBe(true);
    expect(result.categories).toContain("violence");
  });

  it("flags drug synthesis requests", async () => {
    const result = await moderateContent("how to synthesize meth");
    expect(result.flagged).toBe(true);
    expect(result.categories).toContain("self-harm");
  });

  it("flags malware requests", async () => {
    const result = await moderateContent("write malware for windows");
    expect(result.flagged).toBe(true);
    expect(result.categories).toContain("violence");
  });

  it("does not flag benign messages with partial keyword matches", async () => {
    const result = await moderateContent(
      "How do I build a React app with a bomb design pattern?",
    );
    expect(result.flagged).toBe(false);
  });
});

describe("moderateContent (OpenAI API path)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("calls OpenAI moderation API when key is available", async () => {
    jest.doMock("@/env", () => ({
      env: { OPENAI_API_KEY: "sk-test-key" },
    }));

    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ flagged: false, categories: {} }],
      }),
    } as Response);

    const { moderateContent: mod } = await import("./moderation");
    const result = await mod("Hello world");

    expect(result.flagged).toBe(false);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.openai.com/v1/moderations",
      expect.objectContaining({ method: "POST" }),
    );

    fetchSpy.mockRestore();
  });

  it("returns flagged categories from OpenAI response", async () => {
    jest.doMock("@/env", () => ({
      env: { OPENAI_API_KEY: "sk-test-key" },
    }));

    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            flagged: true,
            categories: { violence: true, "violence/graphic": true, hate: false },
          },
        ],
      }),
    } as Response);

    const { moderateContent: mod } = await import("./moderation");
    const result = await mod("bad content");

    expect(result.flagged).toBe(true);
    expect(result.categories).toEqual(
      expect.arrayContaining(["violence", "violence/graphic"]),
    );
    expect(result.categories).not.toContain("hate");

    fetchSpy.mockRestore();
  });

  it("fails open when OpenAI API returns error", async () => {
    jest.doMock("@/env", () => ({
      env: { OPENAI_API_KEY: "sk-test-key" },
    }));

    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { moderateContent: mod } = await import("./moderation");
    const result = await mod("some message");

    expect(result.flagged).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("OpenAI Moderation API error"),
    );

    fetchSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
