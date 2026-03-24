import { chunkText, chunkMarkdown } from "./chunking";

describe("chunkText", () => {
  it("returns empty array for empty input", () => {
    expect(chunkText("", 100, 20)).toEqual([]);
    expect(chunkText("   ", 100, 20)).toEqual([]);
  });

  it("returns single chunk when text fits within maxChunkSize", () => {
    const text = "Hello, world!";
    const result = chunkText(text, 100, 20);
    expect(result).toEqual([text]);
  });

  it("splits long text into multiple chunks", () => {
    const text = "A".repeat(500);
    const result = chunkText(text, 200, 0);
    expect(result.length).toBeGreaterThan(1);
    // Every chunk should be at most maxChunkSize
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(200);
    }
  });

  it("creates overlapping chunks when overlap > 0", () => {
    // Use text without sentence boundaries so chunks are split at character level
    const text = "A".repeat(300);
    const result = chunkText(text, 200, 50);
    expect(result.length).toBe(2);
    // second chunk should start before the first one ends (overlap region)
    expect(result[0]!.length + result[1]!.length).toBeGreaterThan(300);
  });

  it("tries to split on sentence boundaries", () => {
    const text =
      "This is the first sentence. This is the second sentence. This is the third sentence. This is a very long fourth sentence that goes on and on.";
    const result = chunkText(text, 80, 10);
    // Should split on periods, not mid-word
    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(80);
    }
  });
});

describe("chunkMarkdown", () => {
  it("returns empty array for empty input", () => {
    expect(chunkMarkdown("", 100, 20)).toEqual([]);
  });

  it("returns single chunk for small markdown", () => {
    const md = "# Title\n\nSome content.";
    expect(chunkMarkdown(md, 500, 20)).toEqual([md]);
  });

  it("splits on markdown headings", () => {
    const md = [
      "# Main Title",
      "First section content.",
      "## Section Two",
      "Second section content.",
      "## Section Three",
      "Third section content.",
    ].join("\n");
    const result = chunkMarkdown(md, 50, 10);
    expect(result.length).toBeGreaterThan(1);
    // Each heading should start a new chunk
    const headingChunks = result.filter(
      (c) => c.startsWith("#") || c.includes("\n#"),
    );
    expect(headingChunks.length).toBeGreaterThan(0);
  });

  it("falls back to paragraph splitting for large sections", () => {
    const largeParagraphs = Array(10)
      .fill("This is a paragraph with enough content to matter.")
      .join("\n\n");
    const md = `## Large Section\n\n${largeParagraphs}`;
    const result = chunkMarkdown(md, 100, 10);
    expect(result.length).toBeGreaterThan(1);
    for (const chunk of result) {
      expect(chunk.length).toBeLessThanOrEqual(100);
    }
  });
});
