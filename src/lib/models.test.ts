import { streamText } from "ai";
import { expect, test, vi } from "vitest";

import { MODEL_MAP, NANO_GPT_SERVICE_TIER } from "./models";

test("nano gpt requests are sent with the configured service tier", async () => {
	const bodies: unknown[] = [];

	vi.stubGlobal("fetch", async (_url: unknown, init: RequestInit) => {
		bodies.push(JSON.parse(String(init.body)));
		return new Response(
			'data: {"choices":[{"delta":{"content":"hi"},"index":0}]}\n\ndata: [DONE]\n\n',
			{ headers: { "content-type": "text/event-stream" } },
		);
	});

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
});
