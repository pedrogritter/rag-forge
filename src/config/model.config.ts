export const modelConfig = {
  provider: "openai", // 'openai' | 'anthropic' | 'mistral' | 'groq' etc.
  model: "gpt-4o-mini", //'gpt-4-0125-preview',
  temperature: 0.4,
  // maxTokens: 4096,
  tools: {
    useGetInfoTool: true,
    useStoreRelevantTool: true,
  },
  // apiKeys: {
  //   openai: process.env.OPENAI_API_KEY,
  //   anthropic: process.env.CLAUDE_API_KEY,
  // }
};
