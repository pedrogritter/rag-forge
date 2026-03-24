import { rateLimit } from "./rate-limit";

// Each test needs a unique key to avoid interference across tests,
// since the rate-limit store is in-memory and shared within the process.

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = "test-allow";
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000)).toEqual({ allowed: true });
    }
  });

  it("rejects requests over the limit", () => {
    const key = "test-reject";
    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 60_000);
    }
    const result = rateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
    }
  });

  it("resets after window expires", async () => {
    const key = "test-reset";
    const windowMs = 50; // 50ms window

    // Exhaust limit
    for (let i = 0; i < 2; i++) {
      rateLimit(key, 2, windowMs);
    }
    expect(rateLimit(key, 2, windowMs).allowed).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(rateLimit(key, 2, windowMs)).toEqual({ allowed: true });
  });

  it("tracks different keys independently", () => {
    const key1 = "test-independent-a";
    const key2 = "test-independent-b";

    // Exhaust key1
    rateLimit(key1, 1, 60_000);
    expect(rateLimit(key1, 1, 60_000).allowed).toBe(false);

    // key2 should still be allowed
    expect(rateLimit(key2, 1, 60_000)).toEqual({ allowed: true });
  });
});
