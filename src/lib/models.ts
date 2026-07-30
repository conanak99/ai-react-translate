import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Subset of the AI SDK's `reasoning` call setting. Providers translate it into
// their own knob; Nano GPT sends it as `reasoning_effort`.
// https://docs.nano-gpt.com/api-reference/miscellaneous/extended-thinking
export type ReasoningEffort =
	| "none"
	| "minimal"
	| "low"
	| "medium"
	| "high"
	| "xhigh";

function nanoGptModel<const TSubmodel extends string>({
	submodel,
	label,
	reasoningEffort,
}: {
	submodel: TSubmodel;
	label: string;
	reasoningEffort?: ReasoningEffort;
}) {
	return {
		submodel,
		modelType: `nanogpt|${submodel}` as `nanogpt|${TSubmodel}`,
		label,
		reasoningEffort,
	};
}

// https://docs.nano-gpt.com/api-reference/endpoint/chat-completion#service-tiers-priority
export type NanoGptServiceTier = "auto" | "default" | "flex" | "priority";

// Flex trades guaranteed capacity for lower prices, which suits translation
// requests that are not latency critical.
export const NANO_GPT_SERVICE_TIER: NanoGptServiceTier = "flex";

export const NANO_GPT_MODELS = {
	// Disabled: output quality was too low for translation use.
	// mimoThinking: nanoGptModel({
	// 	submodel: "xiaomi/mimo-v2.5-pro:thinking",
	// 	label: "Mimo V2.5 Pro",
	// }),
	glm: nanoGptModel({
		submodel: "zai-org/glm-5.2",
		label: "GLM 5.2",
	}),
	geminiFlash: nanoGptModel({
		submodel: "google/gemini-3.6-flash",
		label: "Gemini 3.6 Flash",
	}),
	kimi: nanoGptModel({
		submodel: "moonshotai/kimi-k3",
		label: "Kimi K3",
		// "xhigh" is the maximum depth and burns far more reasoning tokens than a
		// chapter translation needs.
		reasoningEffort: "high",
	}),
	museSpark: nanoGptModel({
		submodel: "meta/muse-spark-1.1",
		label: "Muse Spark 1.1",
	}),
	// Disabled: safety filters reject the chapters we send, so every request
	// fails with "Your prompt was blocked by safety filters."
	// gptSol: nanoGptModel({
	// 	submodel: "openai/gpt-5.6-sol",
	// 	label: "GPT 5.6 Sol",
	// }),
	// Disabled: output quality was too low for translation use.
	// grok: nanoGptModel({
	// 	submodel: "x-ai/grok-4.5",
	// 	label: "Grok 4.5",
	// }),
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

export function isNanoGptModel(model: ModelType): model is NanoGptModelType {
	return model.startsWith("nanogpt|");
}

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

export const anthropicModel = anthropic("claude-opus-5");

// export const googleModel = google("gemini-2.5-pro");
export const googleModel = google("gemini-3.1-pro-preview");

export const googleFlashModel = google("gemini-3.6-flash");

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

export const MODEL_REASONING_EFFORT: Partial<
	Record<ModelType, ReasoningEffort>
> = Object.fromEntries(
	Object.values(NANO_GPT_MODELS)
		.filter((model) => model.reasoningEffort != null)
		.map(({ modelType, reasoningEffort }) => [modelType, reasoningEffort]),
);
