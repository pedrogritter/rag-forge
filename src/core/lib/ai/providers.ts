import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { modelConfig, vectorConfig } from "@/config";

/**
 * Supported LLM chat providers.
 * Each provider reads its API key from the corresponding environment variable:
 *   openai    → OPENAI_API_KEY
 *   anthropic → ANTHROPIC_API_KEY
 *   google    → GOOGLE_GENERATIVE_AI_API_KEY
 */
const chatProviders = {
  openai,
  anthropic,
  google,
} as const;

export type ChatProvider = keyof typeof chatProviders;

/**
 * Returns the language model configured in `modelConfig`,
 * or uses overrides when provided (e.g. from user settings).
 */
export function getChatModel(
  providerOverride?: string,
  modelOverride?: string,
) {
  const providerKey = (providerOverride ??
    modelConfig.provider) as ChatProvider;
  const modelId = modelOverride ?? modelConfig.model;
  const provider = chatProviders[providerKey];
  if (!provider) {
    throw new Error(
      `Unsupported chat provider "${providerKey}". ` +
        `Supported: ${Object.keys(chatProviders).join(", ")}`,
    );
  }
  return provider(modelId);
}

/**
 * Returns the embedding model configured in `vectorConfig`.
 * Currently only OpenAI embedding models are supported — changing the embedding
 * model requires re-vectorizing the knowledge base (different dimensions).
 */
export function getEmbeddingModel() {
  return openai.embedding(vectorConfig.embedding.model);
}
