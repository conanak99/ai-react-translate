// import { createOpenAI } from "@ai-sdk/openai";
// import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import type { APIRoute } from "astro";
import delay from "delay";

// const openai = createOpenAI({
//   apiKey: import.meta.env.OPEN_AI_KEY,
// });

// const anthropic = createAnthropic({
//   apiKey: import.meta.env.CLAUDE_AI_KEY,
// });

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_KEY,
});

const SYSTEM_PROMPT = `You are a highly skilled translator and writer specializing in wuxia novels.
Your task is to transform draft paragraphs into a polished Vietnamese wuxia novel translation, adhering to the genre's style and conventions.
Your goal is to create a complete, engaging translation that captures the essence of the original text while incorporating the unique elements of the wuxia genre.

Please follow these steps to complete the translation:

1. Carefully read through the draft paragraphs above.

2. Translate the entire text into Vietnamese, ensuring accuracy and capturing the essence of the original.

3. Adapt the translated text to fit the wuxia genre by incorporating the following elements:
   - Martial arts terminology and techniques
   - Poetic and flowery language
   - Cultural references specific to the wuxia genre
   - Dramatic descriptions of action scenes
   - Character titles and honorifics

4. Keep these terminologies intact
<terms>
đệ tam cảnh, đệ tứ cảnh, đệ ngũ cảnh... đệ cửu cảnh
</terms>

4. Enhance the narrative by expanding on descriptions, dialogues, or internal monologues that align with the wuxia style. Maintain the core plot and character development from the original draft.

5. Ensure that the language used is appropriate for a Vietnamese audience, taking into account cultural nuances and idiomatic expressions.

6. Review and refine your translation, making sure it flows smoothly and captures the excitement and atmosphere of a wuxia novel.

IMPORTANT: You must translate the entire text from beginning to end without stopping. Do not leave any part of the translation incomplete.
Provide your complete translation in Vietnamese, using <translation> tags.

Example output structure:
<translation>
[Your complete Vietnamese translation of the wuxia novel, from beginning to end]
</translation>

Remember, it is crucial that you complete the entire translation without stopping. If you find yourself running out of space, simply continue in a new response, picking up exactly where you left off.

Now, please proceed with your analysis and translation of the draft paragraphs.
`;

type Result = Awaited<ReturnType<typeof streamText>>;

const RESULT_CACHE: Map<
  string,
  { status: "pending" | "success"; result?: Result }
> = new Map();

function getNextChapterUrl(inputURL: string) {
  // Example input `https://truyenyy.vip/truyen/thinh-cong-tu-tram-yeu/chuong-309.html`
  // Get chapter number from url using regex
  const chapterNumber = inputURL.match(/\d+/)?.[0];

  // Change chapter number by change value
  const newChapterNumber = Number(chapterNumber) + 1;

  // Replace chapter number in url
  const newUrl = inputURL.replace(
    String(chapterNumber),
    newChapterNumber.toString()
  );
  return newUrl;
}

async function getStreamResult(url: string): Promise<Result> {
  console.log(`Fetching content from: https://r.jina.ai/${url}`);
  const response = await fetch(`https://r.jina.ai/${url}`);
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
      { role: "system", content: SYSTEM_PROMPT },
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
  ignoreCache: boolean
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
      result = await getStreamResult(url);
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
  // useCompletion hardcode the prompt object lol
  const { prompt, ignoreCache }: { prompt: string; ignoreCache: boolean } =
    await request.json();
  const url = prompt;

  const result = await getStreamFromCache(url, ignoreCache);

  if (!ignoreCache) {
    // Just call it to prefetch next chapter
    const nextChapterUrl = getNextChapterUrl(url);
    getStreamFromCache(nextChapterUrl, ignoreCache);
  }

  return result?.toDataStreamResponse() ?? new Response(null, { status: 501 });
};
