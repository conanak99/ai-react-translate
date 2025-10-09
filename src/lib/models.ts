import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type ModelType = "google" | "anthropic" | "legacy" | "deepseek";

const anthropic = createAnthropic({
  apiKey: import.meta.env.CLAUDE_AI_KEY,
});

const deepseek = createDeepSeek({
  apiKey: import.meta.env.DEEPSEEK_API_KEY ?? "",
});

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_KEY,
});

export const anthropicModel = anthropic("claude-sonnet-4-5-20250929");

export const googleModel = google("gemini-2.5-pro");

// Why? Because old model is less censored haizz
export const legacyGoogleModel = google("gemini-1.5-pro-latest");

// Keep deepseek for potential future use
export const deepseekModel = deepseek("deepseek-reasoner");

// Model map
export const MODEL_MAP = {
  google: googleModel,
  anthropic: anthropicModel,
  legacy: legacyGoogleModel,
  deepseek: deepseekModel,
} as const;

export const MODEL_MAX_TOKENS: Partial<Record<ModelType, number>> = {
  anthropic: 32000,
  deepseek: 8192,
};
