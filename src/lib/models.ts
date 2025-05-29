import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createAnthropic } from "@ai-sdk/anthropic";

export type ModelType = 'google' | 'anthropic' | 'legacy' | 'deepseek';

const anthropic = createAnthropic({
	apiKey: import.meta.env.CLAUDE_AI_KEY,
});

const deepseek = createDeepSeek({
	apiKey: import.meta.env.DEEPSEEK_API_KEY ?? "",
});

const google = createGoogleGenerativeAI({
	apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_KEY,
});

export const anthropicModel = anthropic('claude-4-sonnet-20250514', {

});

export const googleModel = google("gemini-2.5-pro-preview-05-06", {
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
});

// Why? Because old model is less censored haizz
export const legacyGoogleModel = google('gemini-1.5-pro-latest', {
	safetySettings: [
		{ category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
		{ category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
		{
			category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
			threshold: "BLOCK_NONE",
		},
		{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
	],
});

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