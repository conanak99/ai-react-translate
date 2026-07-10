import { DEFAULT_MODEL_TYPE, isModelType, type ModelType } from "./models";

export const LAST_USED_MODEL_STORAGE_KEY = "lastUsedModel";

const LEGACY_MODEL_STORAGE_KEY = "model";

function getBrowserLocalStorage(): Storage | undefined {
	return typeof window === "undefined" ? undefined : window.localStorage;
}

function parseStoredValue(value: string | null): unknown {
	if (value === null) {
		return undefined;
	}

	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

export function getInitialModelFromStorage(
	storage = getBrowserLocalStorage(),
): ModelType {
	if (!storage) {
		return DEFAULT_MODEL_TYPE;
	}

	const lastUsedModel = parseStoredValue(
		storage.getItem(LAST_USED_MODEL_STORAGE_KEY),
	);

	if (isModelType(lastUsedModel)) {
		return lastUsedModel;
	}

	const legacyModel = parseStoredValue(
		storage.getItem(LEGACY_MODEL_STORAGE_KEY),
	);

	if (isModelType(legacyModel)) {
		return legacyModel;
	}

	return DEFAULT_MODEL_TYPE;
}

export function persistLastUsedModel(
	model: ModelType,
	storage = getBrowserLocalStorage(),
): void {
	storage?.setItem(LAST_USED_MODEL_STORAGE_KEY, JSON.stringify(model));
}
