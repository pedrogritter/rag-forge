/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-process deployments. For multi-instance production
 * environments, swap this for a Redis-based implementation.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

/** Periodically prune expired entries to avoid unbounded memory growth. */
let requestsSinceCleanup = 0;
const CLEANUP_INTERVAL = 100;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * Check and consume a rate limit token for the given key.
 *
 * @param key       Identifier to rate-limit on (e.g. IP address or user ID)
 * @param limit     Maximum number of requests allowed per window
 * @param windowMs  Window duration in milliseconds
 * @returns `{ allowed: true }` if the request is permitted, or
 *          `{ allowed: false, retryAfterMs }` if the limit is exceeded.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  // Periodic cleanup
  requestsSinceCleanup++;
  if (requestsSinceCleanup >= CLEANUP_INTERVAL) {
    requestsSinceCleanup = 0;
    cleanup();
  }

  const now = Date.now();
  const entry = store.get(key);

  // New window or expired window
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  // Within window — check limit
  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}
