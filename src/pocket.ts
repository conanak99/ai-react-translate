import PocketBase from "pocketbase";

const API_URL = "https://pocketbase.codedao.cc";
const COLLECTION_NAME = "key_values";

const KEY = "ai_translate_url";

const pb = new PocketBase(API_URL);

type KeyValue = {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  key: string;
  value: string;
  json: string;
};

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

export async function setTranslateUrl(url: string) {
  const record = await getKeyValue(KEY);
  const updatedRecord = await pb
    .collection<KeyValue>(COLLECTION_NAME)
    .update(record.id, { value: url });
  return updatedRecord;
}
