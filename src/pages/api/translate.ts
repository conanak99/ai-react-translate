import { streamText } from "ai";
import type { APIRoute } from "astro";
import delay from "delay";
import { type Mode, getPromptMap } from "../../lib/translation/constants";
import { getNextChapterUrl } from "@/lib/utils";
import { anthropicModel, googleModel } from "@/lib/models";


type Result = Awaited<ReturnType<typeof streamText>>;

const RESULT_CACHE: Map<
  string,
  { status: "pending" | "success"; result?: Result }
> = new Map();

function getCacheKey(url: string, mode: Mode, model: 'google' | 'anthropic'): string {
  return `${url}|${mode}|${model}`;
}

async function getStreamResult(url: string, mode: Mode, model: 'google' | 'anthropic' = 'google'): Promise<Result> {
  console.log(`Fetching content from: https://r.jina.ai/${url}`);

  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      Authorization: `Bearer ${import.meta.env.JINA_API_KEY}`,
    },
  });

  const html = await response.text();
  console.log("Content fetched successfully");

  const PROMPT_MAP = await getPromptMap();

  console.time("streamText");
  const result = await streamText({
    // model: openai("gpt-4o-mini"),
    model: model === 'google' ? googleModel : anthropicModel,
    // model: deepseek("deepseek-reasoner"),
    // maxTokens: 8192,
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
    ...(model === 'anthropic' && {
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 2048 },
        }
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
  model: 'google' | 'anthropic' = 'google'
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
    model: 'google' | 'anthropic';
  } = await request.json();
  const url = prompt;

  const result = await getStreamFromCache(url, mode, ignoreCache, model);

  if (!ignoreCache) {
    // Just call it to prefetch next chapter
    const nextChapterUrl = getNextChapterUrl(url);
    getStreamFromCache(nextChapterUrl, mode, ignoreCache, model);
  }

  return (
    result?.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error({ error });
        return "Error";
      },
      sendReasoning: true,
    }) ?? new Response(null, { status: 501 })
  );
};
