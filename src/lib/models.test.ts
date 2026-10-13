import { streamText } from "ai";
import { expect, test, vi } from "vitest";

import {
	getProviderOptions,
	MODEL_MAP,
	MODEL_REASONING_EFFORT,
	MODEL_SERVICE_TIER,
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

test("nano gpt requests with service tier configure provider options", async () => {
	const model = "nanogpt|google/gemini-3.8-flash";
	expect(MODEL_SERVICE_TIER[model]).toBe("flex");

	const bodies: unknown[] = [];
	stubStreamingFetch(bodies);

	const result = streamText({
		model: MODEL_MAP[model],
		prompt: "hello",
		providerOptions: getProviderOptions(model),
	});
	await result.consumeStream();

	expect(bodies[0]).toMatchObject({
		model: "google/gemini-3.8-flash",
		service_tier: "flex",
	});
	expect(bodies[0]).not.toHaveProperty("reasoning_effort");
});

test("muse wonder model does not send service_tier parameter", async () => {
	const model = "nanogpt|meta/muse-wonder";
	expect(MODEL_MAP[model]).toBeDefined();
	expect(MODEL_SERVICE_TIER[model]).toBeUndefined();
	expect(getProviderOptions(model)).toBeUndefined();

	const bodies: unknown[] = [];
	stubStreamingFetch(bodies);

	const result = streamText({
		model: MODEL_MAP[model],
		prompt: "hello",
		providerOptions: getProviderOptions(model),
	});
	await result.consumeStream();

	expect(bodies[0]).toMatchObject({
		model: "meta/muse-wonder",
	});
	expect(bodies[0]).not.toHaveProperty("service_tier");
	expect(bodies[0]).not.toHaveProperty("reasoning_effort");
});

test("gemini argon model is registered and omits service_tier", async () => {
	const model = "nanogpt|google/gemini-4-argon";
	expect(MODEL_MAP[model]).toBeDefined();
	expect(MODEL_SERVICE_TIER[model]).toBeUndefined();
	expect(getProviderOptions(model)).toBeUndefined();

	const bodies: unknown[] = [];
	stubStreamingFetch(bodies);

	const result = streamText({
		model: MODEL_MAP[model],
		prompt: "hello",
		providerOptions: getProviderOptions(model),
	});
	await result.consumeStream();

	expect(bodies[0]).toMatchObject({
		model: "google/gemini-4-argon",
	});
	expect(bodies[0]).not.toHaveProperty("service_tier");
	expect(bodies[0]).not.toHaveProperty("reasoning_effort");
});

test("kimi k3 asks for high, not maximum, reasoning effort and omits service_tier", async () => {
	const model = "nanogpt|moonshotai/kimi-k3";
	expect(MODEL_REASONING_EFFORT[model]).toBe("high");
	expect(MODEL_SERVICE_TIER[model]).toBeUndefined();

	const bodies: unknown[] = [];
	stubStreamingFetch(bodies);

	const result = streamText({
		model: MODEL_MAP[model],
		prompt: "hello",
		reasoning: MODEL_REASONING_EFFORT[model],
		providerOptions: getProviderOptions(model),
	});
	await result.consumeStream();

	expect(bodies[0]).toMatchObject({
		model: "moonshotai/kimi-k3",
		reasoning_effort: "high",
	});
	expect(bodies[0]).not.toHaveProperty("service_tier");
});
