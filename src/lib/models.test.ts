import { streamText } from "ai";
import { expect, test, vi } from "vitest";

import {
	getProviderOptions,
	MODEL_MAP,
	MODEL_MAX_TOKENS,
	MODEL_SERVICE_TIER,
	NANO_GPT_MODELS,
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

test("nano gpt models only include gemini 3.8 flash, qwen 3.8 max thinking, and gemini 4 argon", () => {
	expect(Object.values(NANO_GPT_MODELS).map((model) => model.submodel)).toEqual(
		[
			"google/gemini-3.8-flash",
			"qwen3.8-max:thinking",
			"google/gemini-4-argon",
		],
	);
});

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

test("qwen 3.8 max thinking model is registered and omits service_tier", async () => {
	const model = "nanogpt|qwen3.8-max:thinking";
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
		model: "qwen3.8-max:thinking",
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

test("direct models configure expected model ids and token limits", () => {
	expect(MODEL_MAP.google_flash.modelId).toBe("gemini-3.8-flash");
	expect(MODEL_MAP.deepseek.modelId).toBe("deepseek-v4-pro");
	expect(MODEL_MAP.deepseek_flash.modelId).toBe("deepseek-flash");
	expect(MODEL_MAP.anthropic.modelId).toBe("claude-opus-5-5");

	expect(MODEL_MAX_TOKENS.anthropic).toBe(128000);
	expect(MODEL_MAX_TOKENS.deepseek).toBe(48000);
	expect(MODEL_MAX_TOKENS.deepseek_flash).toBe(48000);
});
