import { NextResponse } from "next/server";

/** Common models per provider for the settings UI. */
const providerModels: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1-nano", "o4-mini"],
  anthropic: [
    "claude-sonnet-4-20250514",
    "claude-haiku-4-20250414",
  ],
  google: ["gemini-2.5-flash-preview-05-20", "gemini-2.0-flash"],
};

const providerEnvKeys: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

export function GET() {
  const available = Object.entries(providerEnvKeys)
    .filter(([, envKey]) => !!process.env[envKey])
    .map(([name]) => ({
      name,
      models: providerModels[name] ?? [],
    }));

  return NextResponse.json(available);
}
