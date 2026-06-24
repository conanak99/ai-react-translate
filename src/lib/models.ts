import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

function nanoGptModel<const TSubmodel extends string>({
	submodel,
	label,
}: {
	submodel: TSubmodel;
	label: string;
}) {
	return {
		submodel,
		modelType: `nanogpt|${submodel}` as `nanogpt|${TSubmodel}`,
		label,
	};
}

export const NANO_GPT_MODELS = {
	mimoThinking: nanoGptModel({
		submodel: "xiaomi/mimo-v2.5-pro:thinking",
		label: "Mimo V2.5 Pro",
	}),
	glm: nanoGptModel({
		submodel: "zai-org/glm-5.2",
		label: "GLM 5.2",
	}),
	geminiFlash: nanoGptModel({
		submodel: "google/gemini-3.5-flash",
		label: "Gemini 3.5 Flash",
	}),
} as const;

export type NanoGptModel =
	(typeof NANO_GPT_MODELS)[keyof typeof NANO_GPT_MODELS];
export type NanoGptModelType = NanoGptModel["modelType"];

export type ModelType =
	| "google"
	| "google_flash"
	| "anthropic"
	| "deepseek"
	| NanoGptModelType;

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

export const anthropicModel = anthropic("claude-opus-4-8");

// export const googleModel = google("gemini-2.5-pro");
export const googleModel = google("gemini-3.1-pro-preview");

export const googleFlashModel = google("gemini-3.5-flash");

const nanoGptModelMap = Object.fromEntries(
	Object.values(NANO_GPT_MODELS).map(({ modelType, submodel }) => [
		modelType,
		nanoGptOpenAICompatible(submodel),
	]),
) as Record<NanoGptModelType, ReturnType<typeof nanoGptOpenAICompatible>>;

// Keep the persisted "deepseek" option stable while targeting DeepSeek's
// current recommended production model.
export const deepseekModel = deepseek("deepseek-v4-pro");

// Model map
export const MODEL_MAP = {
	google: googleModel,
	google_flash: googleFlashModel,
	anthropic: anthropicModel,
	deepseek: deepseekModel,
	...nanoGptModelMap,
} as const;

export const MODEL_MAX_TOKENS: Partial<Record<ModelType, number>> = {
	anthropic: 128000,
	deepseek: 48000,
};
