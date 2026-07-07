import PocketBase from "pocketbase";

const API_URL = "https://pocketbase.codedao.cc";
const COLLECTION_NAME = "key_values";

const KEY = "ai_translate_url";
const NAMES_KEY = "names";

const pb = new PocketBase(API_URL);

export type NameEntry = {
	key: string;
	value: string;
	disabled: boolean;
};

type KeyValue = {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
	key: string;
	value: string;
	json: unknown;
};

interface Link {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
	link: string;
}
async function getKeyValue(key: string) {
	const record = await pb
		.collection<KeyValue>(COLLECTION_NAME)
		.getFirstListItem(`key="${key}"`);
	return record;
}

export async function getTranslateUrl() {
	const record = await getKeyValue(KEY);
	return record.value;
}

export async function getNames(): Promise<Record<string, string>> {
	const names = await getStoredNames();

	return Object.fromEntries(
		names
			.filter(({ disabled }) => !disabled)
			.map(({ key, value }) => [key, value]),
	);
}

export async function getStoredNames(): Promise<NameEntry[]> {
	const record = await getKeyValue(NAMES_KEY);
	return record.json as NameEntry[];
}

async function updateStoredNames(names: NameEntry[]) {
	const record = await getKeyValue(NAMES_KEY);
	const updatedRecord = await pb
		.collection<KeyValue>(COLLECTION_NAME)
		.update(record.id, { json: names });
	return updatedRecord.json as NameEntry[];
}

export async function addNameEntry({
	key,
	value,
}: Pick<NameEntry, "key" | "value">): Promise<NameEntry[]> {
	const names = await getStoredNames();
	const normalizedKey = key.trim();

	if (names.some((name) => name.key === normalizedKey)) {
		throw new Error(`Name "${normalizedKey}" already exists`);
	}

	return updateStoredNames([
		...names,
		{
			key: normalizedKey,
			value: value.trim(),
			disabled: false,
		},
	]);
}

export async function deleteNameEntry(key: string): Promise<NameEntry[]> {
	const names = await getStoredNames();
	return updateStoredNames(names.filter((name) => name.key !== key));
}

export async function setNameEntryDisabled({
	key,
	disabled,
}: Pick<NameEntry, "key" | "disabled">): Promise<NameEntry[]> {
	const names = await getStoredNames();
	return updateStoredNames(
		names.map((name) => (name.key === key ? { ...name, disabled } : name)),
	);
}

export async function setTranslateUrl(url: string) {
	const record = await getKeyValue(KEY);
	const updatedRecord = await pb
		.collection<KeyValue>(COLLECTION_NAME)
		.update(record.id, { value: url });
	return updatedRecord;
}

const LINKS_COLLECTION = "links";

export async function addLink(link: string) {
	const record = await pb.collection<Link>(LINKS_COLLECTION).create({
		link: link,
	});
	return record;
}

export async function getLatestLinks() {
	const records = await pb.collection<Link>(LINKS_COLLECTION).getList(1, 20, {
		sort: "-created",
	});
	return records.items;
}
