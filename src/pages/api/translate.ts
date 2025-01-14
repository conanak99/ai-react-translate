import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import type { APIRoute } from "astro";
import delay from "delay";
import { type Mode, PROMPT_MAP } from "../../lib/translation/constants";
import { getNextChapterUrl } from "@/lib/utils";

// const openai = createOpenAI({
//   apiKey: import.meta.env.OPEN_AI_KEY,
// });

// const anthropic = createAnthropic({
//   apiKey: import.meta.env.CLAUDE_AI_KEY,
// });

const google = createGoogleGenerativeAI({
	apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_KEY,
});

type Result = Awaited<ReturnType<typeof streamText>>;

const RESULT_CACHE: Map<
	string,
	{ status: "pending" | "success"; result?: Result }
> = new Map();

async function getStreamResult(url: string, mode: Mode): Promise<Result> {
	console.log(`Fetching content from: https://r.jina.ai/${url}`);
	const response = await fetch(`https://r.jina.ai/${url}`, {
		headers: {
			Authorization: `Bearer ${import.meta.env.JINA_API_KEY}`,
		},
	});

	const html = await response.text();
	console.log("Content fetched successfully");

	console.time("streamText");
	const result = await streamText({
		// model: openai("gpt-4o-mini"),
		// model: anthropic("claude-3-5-sonnet-20241022"),
		maxTokens: 8192,
		model: google("gemini-1.5-pro-002", {
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
			],
		}),
		messages: [
			{
				role: "system",
				content: PROMPT_MAP[mode],
			},
			{
				role: "user",
				content: `Here are the draft paragraphs you will be working with:
<draft>
${html}
</draft>`,
			},
		],
	});
	console.timeEnd("streamText");

	return result;
}

async function getStreamFromCache(
	url: string,
	mode: Mode,
	ignoreCache: boolean,
): Promise<Result> {
	console.log({ url, ignoreCache });

	let result: Result | undefined;

	if (!ignoreCache && RESULT_CACHE.has(url)) {
		const cache = RESULT_CACHE.get(url);
		if (cache?.status === "success") {
			result = cache.result;
		} else {
			// Wait up to 2 minutes checking for result
			const startTime = Date.now();
			const twoMinutes = 2 * 60 * 1000;

			while (Date.now() - startTime < twoMinutes) {
				// Check if cache was updated
				console.log("Checking cache...", Date.now() - startTime);
				const currentCache = RESULT_CACHE.get(url);
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
			RESULT_CACHE.set(url, { status: "pending" });
			result = await getStreamResult(url, mode);
			RESULT_CACHE.set(url, { status: "success", result });
		} catch (error) {
			RESULT_CACHE.delete(url);
			throw error;
		}
	}

	if (!result) {
		RESULT_CACHE.delete(url);
		throw new Error("No result");
	}

	return result;
}

export const POST: APIRoute = async ({ request }) => {
	const {
		prompt,
		ignoreCache,
		mode = "wuxia",
	}: {
		prompt: string;
		ignoreCache: boolean;
		mode: Mode;
	} = await request.json();
	const url = prompt;

	const result = await getStreamFromCache(url, mode, ignoreCache);

	if (!ignoreCache) {
		// Just call it to prefetch next chapter
		const nextChapterUrl = getNextChapterUrl(url);
		getStreamFromCache(nextChapterUrl, mode, ignoreCache);
	}

	return result?.toDataStreamResponse() ?? new Response(null, { status: 501 });
};
