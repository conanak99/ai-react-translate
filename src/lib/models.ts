import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export type ModelType =
	| "google"
	| "google_flash"
	| "anthropic"
	| "deepseek"
	| "nanogpt";

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
	name: "nano-gpt",
	apiKey: import.meta.env.NANO_GPT_API_KEY,
	baseURL: "https://nano-gpt.com/api/v1",
});

export const anthropicModel = anthropic("claude-opus-4-5-20251101");

// export const googleModel = google("gemini-2.5-pro");
export const googleModel = google("gemini-3.1-pro-preview");

export const googleFlashModel = google("gemini-3-flash-preview");

export const nanogpt = openaiCompatible("moonshotai/kimi-k2-thinking-original");

// Keep deepseek for potential future use
export const deepseekModel = deepseek("deepseek-reasoner");

// Model map
export const MODEL_MAP = {
	google: googleModel,
	google_flash: googleFlashModel,
	nanogpt: nanogpt,
	anthropic: anthropicModel,
	deepseek: deepseekModel,
} as const;

export const MODEL_MAX_TOKENS: Partial<Record<ModelType, number>> = {
	anthropic: 32000,
	deepseek: 8192,
};
