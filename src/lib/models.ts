import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const NANO_GPT_MIMO_THINKING_SUBMODEL = "xiaomi/mimo-v2.5-pro:thinking";
export const NANO_GPT_GLM_SUBMODEL = "zai-org/glm-5.2";
export const NANO_GPT_GEMINI_FLASH_SUBMODEL = "google/gemini-3.5-flash";
export const NANO_GPT_MIMO_THINKING_MODEL_TYPE =
	`nanogpt|${NANO_GPT_MIMO_THINKING_SUBMODEL}` as const;
export const NANO_GPT_GLM_MODEL_TYPE =
	`nanogpt|${NANO_GPT_GLM_SUBMODEL}` as const;
export const NANO_GPT_GEMINI_FLASH_MODEL_TYPE =
	`nanogpt|${NANO_GPT_GEMINI_FLASH_SUBMODEL}` as const;

export type ModelType =
	| "google"
	| "google_flash"
	| "anthropic"
	| "deepseek"
	| typeof NANO_GPT_MIMO_THINKING_MODEL_TYPE
	| typeof NANO_GPT_GLM_MODEL_TYPE
	| typeof NANO_GPT_GEMINI_FLASH_MODEL_TYPE;

export type ScraperProvider = "jina" | "firecrawl";

const anthropic = createAnthropic({
	apiKey: import.meta.env.CLAUDE_AI_KEY,
});

const deepseek = createDeepSeek({
	apiKey: import.meta.env.DEEPSEEK_API_KEY ?? "",
});

const google = createGoogleGenerativeAI({
	apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_KEY,
});

const nanoGptOpenAICompatible = createOpenAICompatible({
	name: "nano-gpt",
	apiKey: import.meta.env.NANO_GPT_API_KEY,
	baseURL: "https://nano-gpt.com/api/v1",
});

export const anthropicModel = anthropic("claude-fable-5");

// export const googleModel = google("gemini-2.5-pro");
export const googleModel = google("gemini-3.1-pro-preview");

export const googleFlashModel = google("gemini-3.5-flash");

export const mimoThinkingModel = nanoGptOpenAICompatible(
	NANO_GPT_MIMO_THINKING_SUBMODEL,
);

export const glmModel = nanoGptOpenAICompatible(NANO_GPT_GLM_SUBMODEL);

export const nanoGptGeminiFlashModel = nanoGptOpenAICompatible(
	NANO_GPT_GEMINI_FLASH_SUBMODEL,
);

// Keep the persisted "deepseek" option stable while targeting DeepSeek's
// current recommended production model.
export const deepseekModel = deepseek("deepseek-v4-pro");

// Model map
export const MODEL_MAP = {
	google: googleModel,
	google_flash: googleFlashModel,
	[NANO_GPT_MIMO_THINKING_MODEL_TYPE]: mimoThinkingModel,
	[NANO_GPT_GLM_MODEL_TYPE]: glmModel,
	anthropic: anthropicModel,
	deepseek: deepseekModel,
	[NANO_GPT_GEMINI_FLASH_MODEL_TYPE]: nanoGptGeminiFlashModel,
} as const;

export const MODEL_MAX_TOKENS: Partial<Record<ModelType, number>> = {
	anthropic: 128000,
	deepseek: 32000,
};
