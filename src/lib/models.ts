import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export type ModelType = "google" | "anthropic" | "deepseek" | "geminiProMega";

const anthropic = createAnthropic({
  apiKey: import.meta.env.CLAUDE_AI_KEY,
});

const deepseek = createDeepSeek({
  apiKey: import.meta.env.DEEPSEEK_API_KEY ?? "",
});

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_KEY,
});

const openaiCompatible = createOpenAICompatible({
  name: "mega-llm",
  apiKey: import.meta.env.MEGA_LLM_API_KEY,
  baseURL: "https://ai.megallm.io/v1"
});

export const anthropicModel = anthropic("claude-sonnet-4-5-20250929");

export const googleModel = google("gemini-2.5-pro");

export const geminiProMega = openaiCompatible("gemini-2.5-pro");

// Keep deepseek for potential future use
export const deepseekModel = deepseek("deepseek-reasoner");

// Model map
export const MODEL_MAP = {
  google: googleModel,
  geminiProMega: geminiProMega,
  anthropic: anthropicModel,
  deepseek: deepseekModel,
} as const;

export const MODEL_MAX_TOKENS: Partial<Record<ModelType, number>> = {
  anthropic: 32000,
  deepseek: 8192,
};
