import PocketBase from "pocketbase";

const COLLECTION_NAME = "key_values";
const LINKS_COLLECTION = "links";

const KEY = "ai_translate_url";
const NAMES_KEY = "names";

const POCKETBASE_URL = import.meta.env.POCKETBASE_URL;
const pb = POCKETBASE_URL ? new PocketBase(POCKETBASE_URL) : null;

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

export interface Link {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
	link: string;
}

// Used when POCKETBASE_URL is not set; data is lost when the server restarts.
const memoryStore = {
	translateUrl: "",
	names: [] as NameEntry[],
	links: [] as Link[],
};

async function getKeyValue(client: PocketBase, key: string) {
	const record = await client
		.collection<KeyValue>(COLLECTION_NAME)
		.getFirstListItem(`key="${key}"`);
	return record;
}

export async function getTranslateUrl() {
	if (!pb) return memoryStore.translateUrl;

	const record = await getKeyValue(pb, KEY);
	return record.value;
}

export async function setTranslateUrl(url: string) {
	if (!pb) {
		memoryStore.translateUrl = url;
		return url;
	}

	const record = await getKeyValue(pb, KEY);
	const updatedRecord = await pb
		.collection<KeyValue>(COLLECTION_NAME)
		.update(record.id, { value: url });
	return updatedRecord.value;
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
	if (!pb) return memoryStore.names;

	const record = await getKeyValue(pb, NAMES_KEY);
	return record.json as NameEntry[];
}

async function updateStoredNames(names: NameEntry[]) {
	if (!pb) {
		memoryStore.names = names;
		return names;
	}

	const record = await getKeyValue(pb, NAMES_KEY);
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

export async function addLink(link: string) {
	if (!pb) {
		const now = new Date().toISOString();
		const record: Link = {
			id: crypto.randomUUID(),
			collectionId: LINKS_COLLECTION,
			collectionName: LINKS_COLLECTION,
			created: now,
			updated: now,
			link,
		};
		memoryStore.links.unshift(record);
		return record;
	}

	const record = await pb.collection<Link>(LINKS_COLLECTION).create({
		link: link,
	});
	return record;
}

export async function getLatestLinks() {
	if (!pb) return memoryStore.links.slice(0, 1000);

	const links = pb.collection<Link>(LINKS_COLLECTION);
	const firstPage = await links.getList(1, 500, {
		sort: "-created",
	});
	const secondPage = await links.getList(2, 500, {
		sort: "-created",
	});

	return [...firstPage.items, ...secondPage.items];
}
