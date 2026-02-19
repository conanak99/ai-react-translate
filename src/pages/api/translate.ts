import type { AnthropicProviderOptions } from "@ai-sdk/anthropic";
import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { streamText } from "ai";
import type { APIRoute } from "astro";
import delay from "delay";
import { MODEL_MAP, MODEL_MAX_TOKENS, type ModelType } from "@/lib/models";
import { getNextChapterUrl } from "@/lib/utils";
import { getPromptMap, type Mode } from "../../lib/translation/constants";

type Result = Awaited<ReturnType<typeof streamText>>;

const RESULT_CACHE: Map<
	string,
	{ status: "pending" | "success"; result?: Result }
> = new Map();

function getCacheKey(url: string, mode: Mode, model: ModelType): string {
	return `${url}|${mode}|${model}`;
}

async function getStreamResult(
	url: string,
	mode: Mode,
	model: ModelType = "google",
): Promise<Result> {
	console.log(`Fetching content from: https://r.jina.ai/${url}`);

	const jinaApiKey = import.meta.env.JINA_API_KEY;

	const response = await fetch(`https://r.jina.ai/${url}`, {
		headers: jinaApiKey
			? {
					Authorization: `Bearer ${jinaApiKey}`,
				}
			: undefined,
	});

	const html = await response.text();
	console.log("Content fetched successfully");

	const PROMPT_MAP = await getPromptMap();

	console.time("streamText");
	const result = streamText({
		model: MODEL_MAP[model],
		maxOutputTokens: MODEL_MAX_TOKENS[model],
		messages: [
			{
				role: "system",
				content: PROMPT_MAP[mode],
			},
			{
				role: "user",
				content: `Here are the original work you will be working with:
<original>
${html}
</original>`,
			},
		],
		...(model === "anthropic" && {
			providerOptions: {
				anthropic: {
					thinking: { type: "enabled", budgetTokens: 2048 },
				} satisfies AnthropicProviderOptions,
			},
		}),
		...((model === "google" || model === "google_flash") && {
			providerOptions: {
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
			},
		}),
	});
	console.timeEnd("streamText");

	return result;
}

async function getStreamFromCache(
	url: string,
	mode: Mode,
	ignoreCache: boolean,
	model: ModelType = "google",
): Promise<Result> {
	const cacheKey = getCacheKey(url, mode, model);
	console.log({ url, mode, model, cacheKey, ignoreCache });

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
			result = await getStreamResult(url, mode, model);
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
	}: {
		prompt: string;
		ignoreCache: boolean;
		mode: Mode;
		model: ModelType;
	} = await request.json();
	const url = prompt;

	const result = await getStreamFromCache(url, mode, ignoreCache, model);

	if (!ignoreCache) {
		// Just call it to prefetch next chapter
		const nextChapterUrl = getNextChapterUrl(url);
		getStreamFromCache(nextChapterUrl, mode, ignoreCache, model);
	}

	return result?.toTextStreamResponse() ?? new Response(null, { status: 501 });
};
