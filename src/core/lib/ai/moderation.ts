/**
 * Pre-LLM content moderation.
 *
 * If an OpenAI API key is available, uses OpenAI's free Moderation API.
 * Otherwise, falls back to a basic keyword blocklist for obvious harmful
 * content categories.
 */

import { env } from "@/env";

/** Result of a moderation check. */
export interface ModerationResult {
  flagged: boolean;
  categories?: string[];
}

// ---------------------------------------------------------------------------
// OpenAI Moderation API
// ---------------------------------------------------------------------------

interface OpenAIModerationResponse {
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
  }>;
}

async function moderateViaOpenAI(text: string): Promise<ModerationResult> {
  const res = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: text }),
  });

  if (!res.ok) {
    // If the moderation API fails, allow the message through rather than
    // blocking legitimate users. Log the error for ops visibility.
    console.error(
      `OpenAI Moderation API error: ${res.status} ${res.statusText}`,
    );
    return { flagged: false };
  }

  const data = (await res.json()) as OpenAIModerationResponse;
  const result = data.results[0];
  if (!result?.flagged) return { flagged: false };

  const flaggedCategories = Object.entries(result.categories)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return { flagged: true, categories: flaggedCategories };
}

// ---------------------------------------------------------------------------
// Keyword-based fallback (no OpenAI key)
// ---------------------------------------------------------------------------

/**
 * Minimal blocklist patterns for obvious harmful intent.
 * This is NOT a replacement for a real moderation model — it catches only
 * the most explicit and unambiguous phrases to reduce noise.
 */
const BLOCKLIST_PATTERNS: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /how to (make|build|create) a bomb/i, category: "violence" },
  { pattern: /how to (make|synthesize|cook) (meth|fentanyl|heroin)/i, category: "self-harm" },
  { pattern: /how to (hack|break into) (someone'?s|a) (account|system|network)/i, category: "harassment" },
  { pattern: /generate (child|underage) (porn|sexual)/i, category: "sexual/minors" },
  { pattern: /write (malware|ransomware|virus|exploit code)/i, category: "violence" },
];

function moderateViaBlocklist(text: string): ModerationResult {
  const flaggedCategories: string[] = [];
  for (const { pattern, category } of BLOCKLIST_PATTERNS) {
    if (pattern.test(text)) {
      flaggedCategories.push(category);
    }
  }
  if (flaggedCategories.length > 0) {
    return { flagged: true, categories: flaggedCategories };
  }
  return { flagged: false };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether `text` contains potentially harmful content.
 *
 * - Uses OpenAI Moderation API when OPENAI_API_KEY is set (free, fast, accurate).
 * - Falls back to a basic keyword blocklist otherwise.
 *
 * Fail-open: if the moderation service errors, the message is allowed through
 * to avoid blocking legitimate users.
 */
export async function moderateContent(text: string): Promise<ModerationResult> {
  if (env.OPENAI_API_KEY) {
    return moderateViaOpenAI(text);
  }
  return moderateViaBlocklist(text);
}
