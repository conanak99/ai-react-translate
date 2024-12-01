import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { streamText } from "ai";
import type { APIRoute } from "astro";

const anthropic = createAnthropic({
  apiKey: import.meta.env.CLAUDE_AI_KEY,
});
const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_KEY,
});

const SYSTEM_PROMPT = `You are an expert in interpersonal communication and psychology, tasked with interpreting the underlying meaning of a woman's statement. Your goal is to provide a nuanced interpretation that considers both the literal meaning and potential subtext, taking into account emotional nuances and cultural context.

Please follow these steps to formulate your interpretation:

1. Carefully analyze the statement, considering:
   - The literal meaning of the words used
   - Potential subtext or hidden meanings
   - Common communication patterns and cultural norms
   - Emotional tone and any mentioned non-verbal cues
   - Any additional context provided

2. In <interpretation_process> tags, break down your thought process in Vietnamese. Consider multiple perspectives and potential interpretations before finalizing your conclusion. Include the following steps:
   a. Identify key phrases or words that could have multiple interpretations.
   b. List possible cultural contexts that might influence the meaning.
   c. Describe the perceived emotional state of the speaker.
   d. Note any potential non-verbal cues mentioned or implied.
   e. Consider at least two different interpretations of the statement.
   f. Explain your reasoning for choosing one interpretation over others.

3. After your analysis, provide your interpretation in JSON format with the following structure (Vietnamese):
   - literal_meaning: A brief statement of the literal interpretation
   - underlying_thoughts: What you believe the woman is really thinking
   - true_meaning: What you believe the woman actually means by her statement
   - confidence_level: Your level of confidence in this interpretation (low, medium, or high)
   - confidence_explanation: A brief explanation of your confidence level

Here's an example of the expected JSON output structure:

\`\`\`json
{
  "literal_meaning": "Brief literal interpretation",
  "underlying_thoughts": "Explanation of underlying thoughts",
  "true_meaning": "Interpretation of true meaning",
  "confidence_level": "medium",
  "confidence_explanation": "Reason for confidence level"
}
\`\`\`

Remember, this task involves interpretation, and there may not always be a definitive answer. Use your best judgment based on the information provided, and be sure to explain your reasoning in the <interpretation_process> section.
`;

const USER_PROMPT = `Here is the woman's statement you need to interpret (can be in English or Vietnamese):
<woman_statement>
{{WOMAN_STATEMENT}}
</woman_statement>

If additional context is provided, it will appear here:
<additional_context>
{{ADDITIONAL_CONTEXT}}
</additional_context>
`;

type Result = Awaited<ReturnType<typeof streamText>>;

const RESULT_CACHE: Map<
  string,
  { status: "pending" | "success"; result?: Result }
> = new Map();

export const POST: APIRoute = async ({ request }) => {
  const { statement, context }: { statement: string; context: string } =
    await request.json();

  const userPrompt = USER_PROMPT.replace(
    "{{WOMAN_STATEMENT}}",
    statement
  ).replace("{{ADDITIONAL_CONTEXT}}", context);

  const result = await streamText({
    // model: anthropic("claude-3-5-sonnet-20241022", { cacheControl: true }),
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
        content: SYSTEM_PROMPT,
        experimental_providerMetadata: {
          anthropic: {
            cacheControl: { type: "ephemeral" },
          },
        },
      },
      { role: "user", content: userPrompt },
    ],
  });

  return result.toDataStreamResponse();
};
