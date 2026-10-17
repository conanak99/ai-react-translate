import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { streamText } from "ai";

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
	serviceTier,
}: {
	submodel: TSubmodel;
	label: string;
	reasoningEffort?: ReasoningEffort;
	serviceTier?: NanoGptServiceTier;
}) {
	return {
		submodel,
		modelType: `nanogpt|${submodel}` as `nanogpt|${TSubmodel}`,
		label,
		reasoningEffort,
		serviceTier,
	};
}

// https://docs.nano-gpt.com/api-reference/endpoint/chat-completion#service-tiers-priority
export type NanoGptServiceTier = "auto" | "default" | "flex" | "priority";

// Flex trades guaranteed capacity for lower prices, which suits translation
// requests that are not latency critical.
export const NANO_GPT_SERVICE_TIER: NanoGptServiceTier = "flex";

export const NANO_GPT_MODELS = {
	geminiFlash: nanoGptModel({
		submodel: "google/gemini-3.8-flash",
		label: "Gemini 3.8 Flash",
		serviceTier: "flex",
	}),
	qwenMaxThinking: nanoGptModel({
		submodel: "qwen3.8-max:thinking",
		label: "Qwen 3.8 Max Thinking",
	}),
	geminiArgon: nanoGptModel({
		submodel: "google/gemini-4-argon",
		label: "Gemini 4 Argon",
	}),
} as const;

export type NanoGptModel =
	(typeof NANO_GPT_MODELS)[keyof typeof NANO_GPT_MODELS];
export type NanoGptModelType = NanoGptModel["modelType"];

export type ModelType =
	| "google_flash"
	| "anthropic"
	| "deepseek"
	| "deepseek_flash"
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

export const anthropicModel = anthropic("claude-opus-5-5");

export const googleFlashModel = google("gemini-3.8-flash");

const nanoGptModelMap = Object.fromEntries(
	Object.values(NANO_GPT_MODELS).map(({ modelType, submodel }) => [
		modelType,
		nanoGptOpenAICompatible(submodel),
	]),
) as Record<NanoGptModelType, ReturnType<typeof nanoGptOpenAICompatible>>;

// Keep the persisted "deepseek" option stable while targeting DeepSeek's
// current recommended production model.
export const deepseekModel = deepseek("deepseek-v4-pro");

export const deepseekFlashModel = deepseek("deepseek-flash");

// Model map
export const MODEL_MAP = {
	google_flash: googleFlashModel,
	anthropic: anthropicModel,
	deepseek: deepseekModel,
	deepseek_flash: deepseekFlashModel,
	...nanoGptModelMap,
} as const;

export const MODEL_MAX_TOKENS: Partial<Record<ModelType, number>> = {
	anthropic: 128000,
	deepseek: 48000,
	deepseek_flash: 48000,
};

export const MODEL_REASONING_EFFORT: Partial<
	Record<ModelType, ReasoningEffort>
> = Object.fromEntries(
	Object.values(NANO_GPT_MODELS)
		.filter((model) => model.reasoningEffort != null)
		.map(({ modelType, reasoningEffort }) => [modelType, reasoningEffort]),
);

export const MODEL_SERVICE_TIER: Partial<
	Record<ModelType, NanoGptServiceTier>
> = Object.fromEntries(
	Object.values(NANO_GPT_MODELS)
		.filter((model) => model.serviceTier != null)
		.map(({ modelType, serviceTier }) => [modelType, serviceTier]),
);

export type ProviderOptions = NonNullable<
	Parameters<typeof streamText>[0]["providerOptions"]
>;

export function getProviderOptions(
	model: ModelType,
): ProviderOptions | undefined {
	if (model === "google_flash") {
		return {
			google: {
				safetySettings: [
					{ category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
					{
						category: "HARM_CATEGORY_DANGEROUS_CONTENT",
						threshold: "BLOCK_NONE",
					},
					{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
					{
						category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
						threshold: "BLOCK_NONE",
					},
					{
						category: "HARM_CATEGORY_CIVIC_INTEGRITY",
						threshold: "BLOCK_NONE",
					},
				],
			},
		};
	}

	if (isNanoGptModel(model)) {
		const serviceTier = MODEL_SERVICE_TIER[model];
		if (serviceTier) {
			// Unknown keys are forwarded as-is to the chat completion body, which is
			// how Nano GPT expects the service tier to be requested.
			return { nanoGpt: { service_tier: serviceTier } };
		}
		return undefined;
	}

	return undefined;
}
