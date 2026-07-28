import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { createTextStreamResponse, streamText, toTextStream } from "ai";
import type { APIRoute } from "astro";
import delay from "delay";
import { crawl } from "@/lib/crawler";
import {
	isNanoGptModel,
	MODEL_MAP,
	MODEL_MAX_TOKENS,
	type ModelType,
	NANO_GPT_SERVICE_TIER,
	type ScraperProvider,
} from "@/lib/models";
import { getNextChapterUrl } from "@/lib/utils";
import { getPromptMap, type Mode } from "../../lib/translation/constants";

type Result = Awaited<ReturnType<typeof streamText>>;

function toStreamResponse(result: Result | undefined): Response {
	if (!result) {
		return new Response(null, { status: 501 });
	}

	return createTextStreamResponse({
		stream: toTextStream({ stream: result.stream }),
	});
}

const RESULT_CACHE: Map<
	string,
	{ status: "pending" | "success"; result?: Result }
> = new Map();

type ProviderOptions = NonNullable<
	Parameters<typeof streamText>[0]["providerOptions"]
>;

function getProviderOptions(model: ModelType): ProviderOptions | undefined {
	if (model === "google" || model === "google_flash") {
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
			} satisfies GoogleGenerativeAIProviderOptions,
		};
	}

	if (isNanoGptModel(model)) {
		// Unknown keys are forwarded as-is to the chat completion body, which is
		// how Nano GPT expects the service tier to be requested.
		return { nanoGpt: { service_tier: NANO_GPT_SERVICE_TIER } };
	}

	return undefined;
}

function getCacheKey(
	url: string,
	mode: Mode,
	model: ModelType,
	scraperProvider: ScraperProvider,
): string {
	return `${url}|${mode}|${model}|${scraperProvider}`;
}

async function getStreamResultFromSource(
	source: string,
	mode: Mode,
	model: ModelType = "google",
): Promise<Result> {
	const PROMPT_MAP = await getPromptMap();

	console.time("streamText");
	const result = streamText({
		model: MODEL_MAP[model],
		maxOutputTokens: MODEL_MAX_TOKENS[model],
		instructions: PROMPT_MAP[mode],
		messages: [
			{
				role: "user",
				content: `Here are the original work you will be working with:
<original>
${source}
</original>`,
			},
		],
		providerOptions: getProviderOptions(model),
	});
	console.timeEnd("streamText");

	return result;
}

async function getStreamResult(
	url: string,
	mode: Mode,
	model: ModelType = "google",
	scraperProvider: ScraperProvider = "jina",
): Promise<Result> {
	const html = await crawl(url, scraperProvider);
	return getStreamResultFromSource(html, mode, model);
}

async function getContinuationStreamResult(
	url: string,
	mode: Mode,
	model: ModelType = "google",
	scraperProvider: ScraperProvider = "jina",
	continueFrom: string,
	directTranslate = false,
): Promise<Result> {
	const html = directTranslate ? url : await crawl(url, scraperProvider);

	const PROMPT_MAP = await getPromptMap();

	console.time("continueStreamText");
	const result = streamText({
		model: MODEL_MAP[model],
		maxOutputTokens: MODEL_MAX_TOKENS[model],
		instructions: PROMPT_MAP[mode],
		messages: [
			{
				role: "user",
				content: `Here are the original work you will be working with:
<original>
${html}
</original>`,
			},
			{
				role: "assistant",
				content: continueFrom,
			},
			{
				role: "user",
				content:
					"Your previous translation was cut off. Continue from exactly where it stopped. Return only the missing continuation text, without repeating any text already shown and without adding explanations or notes.",
			},
		],
		providerOptions: getProviderOptions(model),
	});
	console.timeEnd("continueStreamText");

	return result;
}

async function getStreamFromCache(
	url: string,
	mode: Mode,
	ignoreCache: boolean,
	model: ModelType = "google",
	scraperProvider: ScraperProvider = "jina",
): Promise<Result> {
	const cacheKey = getCacheKey(url, mode, model, scraperProvider);
	console.log({ url, mode, model, scraperProvider, cacheKey, ignoreCache });

	let result: Result | undefined;

	if (!ignoreCache && RESULT_CACHE.has(cacheKey)) {
		const cache = RESULT_CACHE.get(cacheKey);
		if (cache?.status === "success") {
			result = cache.result;
		} else {
			// Wait up to 2 minutes checking for result
			const startTime = Date.now();
			const twoMinutes = 2 * 60 * 1000;

			while (Date.now() - startTime < twoMinutes) {
				// Check if cache was updated
				console.log("Checking cache...", Date.now() - startTime);
				const currentCache = RESULT_CACHE.get(cacheKey);
				if (currentCache?.status === "success") {
					result = currentCache.result;
					break;
				}

				// Wait before checking again
				await delay(3_000);
			}

			if (!result) {
				throw new Error("Timeout");
			}
		}
	} else {
		try {
			RESULT_CACHE.set(cacheKey, { status: "pending" });
			result = await getStreamResult(url, mode, model, scraperProvider);
			RESULT_CACHE.set(cacheKey, { status: "success", result });
		} catch (error) {
			RESULT_CACHE.delete(cacheKey);
			throw error;
		}
	}

	if (!result) {
		RESULT_CACHE.delete(cacheKey);
		throw new Error("No result");
	}

	return result;
}

export const POST: APIRoute = async ({ request }) => {
	const {
		prompt,
		ignoreCache,
		mode = "wuxia",
		model = "google",
		scraperProvider = "jina",
		continueFrom,
		directTranslate = false,
	}: {
		prompt: string;
		ignoreCache: boolean;
		mode: Mode;
		model: ModelType;
		scraperProvider: ScraperProvider;
		continueFrom?: string;
		directTranslate?: boolean;
	} = await request.json();
	const url = prompt;

	if (continueFrom?.trim()) {
		const result = await getContinuationStreamResult(
			url,
			mode,
			model,
			scraperProvider,
			continueFrom,
			directTranslate,
		);

		return toStreamResponse(result);
	}

	// Direct translate: treat the prompt as the source text itself.
	// No scraping, no cache, no next-chapter prefetch.
	if (directTranslate) {
		const result = await getStreamResultFromSource(prompt, mode, model);

		return toStreamResponse(result);
	}

	const result = await getStreamFromCache(
		url,
		mode,
		ignoreCache,
		model,
		scraperProvider,
	);

	if (!ignoreCache) {
		const nextChapterUrl = getNextChapterUrl(url);
		getStreamFromCache(
			nextChapterUrl,
			mode,
			ignoreCache,
			model,
			scraperProvider,
		);
	}

	return toStreamResponse(result);
};
