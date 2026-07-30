import { streamText } from "ai";
import { expect, test, vi } from "vitest";

import {
	MODEL_MAP,
	MODEL_REASONING_EFFORT,
	NANO_GPT_SERVICE_TIER,
} from "./models";

function stubStreamingFetch(bodies: unknown[]) {
	vi.stubGlobal("fetch", async (_url: unknown, init: RequestInit) => {
		bodies.push(JSON.parse(String(init.body)));
		return new Response(
			'data: {"choices":[{"delta":{"content":"hi"},"index":0}]}\n\ndata: [DONE]\n\n',
			{ headers: { "content-type": "text/event-stream" } },
		);
	});
}

test("nano gpt requests are sent with the configured service tier", async () => {
	const bodies: unknown[] = [];
	stubStreamingFetch(bodies);

	const result = streamText({
		model: MODEL_MAP["nanogpt|zai-org/glm-5.2"],
		prompt: "hello",
		providerOptions: { nanoGpt: { service_tier: NANO_GPT_SERVICE_TIER } },
	});
	await result.consumeStream();

	expect(bodies[0]).toMatchObject({
		model: "zai-org/glm-5.2",
		service_tier: "flex",
	});
	expect(bodies[0]).not.toHaveProperty("reasoning_effort");
});

test("kimi k3 asks for high, not maximum, reasoning effort", async () => {
	const model = "nanogpt|moonshotai/kimi-k3";
	expect(MODEL_REASONING_EFFORT[model]).toBe("high");

	const bodies: unknown[] = [];
	stubStreamingFetch(bodies);

	const result = streamText({
		model: MODEL_MAP[model],
		prompt: "hello",
		reasoning: MODEL_REASONING_EFFORT[model],
		providerOptions: { nanoGpt: { service_tier: NANO_GPT_SERVICE_TIER } },
	});
	await result.consumeStream();

	expect(bodies[0]).toMatchObject({
		model: "moonshotai/kimi-k3",
		service_tier: "flex",
		reasoning_effort: "high",
	});
});
