import type { ChatProvider } from "@/core/lib/ai/providers";

export const modelConfig = {
  /** LLM provider. Set the matching API key in your environment:
   *  openai → OPENAI_API_KEY, anthropic → ANTHROPIC_API_KEY, google → GOOGLE_GENERATIVE_AI_API_KEY */
  provider: "openai" as ChatProvider,
  /** Model ID passed to the provider (e.g. "gpt-4o-mini", "claude-sonnet-4", "gemini-2.0-flash") */
  model: "gpt-4o-mini",
  temperature: 0.4,
  tools: {
    useGetInfoTool: true,
    useStoreRelevantTool: true,
  },
};
