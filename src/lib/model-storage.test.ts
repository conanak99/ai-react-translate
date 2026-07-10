import { expect, test } from "vitest";

import {
	getInitialModelFromStorage,
	LAST_USED_MODEL_STORAGE_KEY,
	persistLastUsedModel,
} from "./model-storage";
import { DEFAULT_MODEL_TYPE, NANO_GPT_MODELS } from "./models";

function createStorage(initialValues: Record<string, string> = {}): Storage {
	const values = new Map(Object.entries(initialValues));

	return {
		get length() {
			return values.size;
		},
		clear() {
			values.clear();
		},
		getItem(key) {
			return values.get(key) ?? null;
		},
		key(index) {
			return Array.from(values.keys())[index] ?? null;
		},
		removeItem(key) {
			values.delete(key);
		},
		setItem(key, value) {
			values.set(key, value);
		},
	};
}

test("restores the last used model from storage", () => {
	const storage = createStorage({
		[LAST_USED_MODEL_STORAGE_KEY]: JSON.stringify("deepseek"),
	});

	expect(getInitialModelFromStorage(storage)).toBe("deepseek");
});

test("falls back to the legacy model key", () => {
	const storage = createStorage({
		model: JSON.stringify(NANO_GPT_MODELS.glm.modelType),
	});

	expect(getInitialModelFromStorage(storage)).toBe(
		NANO_GPT_MODELS.glm.modelType,
	);
});

test("returns the default model when storage is empty or invalid", () => {
	const storage = createStorage({
		[LAST_USED_MODEL_STORAGE_KEY]: JSON.stringify("missing-model"),
		model: JSON.stringify("also-missing"),
	});

	expect(getInitialModelFromStorage(storage)).toBe(DEFAULT_MODEL_TYPE);
	expect(getInitialModelFromStorage()).toBe(DEFAULT_MODEL_TYPE);
});

test("persists the last used model as JSON", () => {
	const storage = createStorage();

	persistLastUsedModel("anthropic", storage);

	expect(storage.getItem(LAST_USED_MODEL_STORAGE_KEY)).toBe(
		JSON.stringify("anthropic"),
	);
});
