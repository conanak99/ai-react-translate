import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToCoreMessages } from "ai";
import type { APIRoute } from "astro";

const openai = createOpenAI({
  apiKey: import.meta.env.OPEN_AI_KEY,
});

const anthropic = createAnthropic({
  apiKey: import.meta.env.CLAUDE_AI_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();
  const chatId = request.headers.get("x-chat-id");

  console.log({ chatId, messages });

  const result = await streamText({
    // model: openai("gpt-4o-mini"),
    // model: anthropic("claude-3-5-sonnet-20241022"),
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
      // { role: "system", content: "You are a helpful assistant." },
      ...convertToCoreMessages(messages),
    ],
  });

  return result.toDataStreamResponse();
};
