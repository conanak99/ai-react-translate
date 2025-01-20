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
    link: link
  });
  return record;
}

export async function getLatestLinks() {
  const records = await pb.collection<Link>(LINKS_COLLECTION).getList(1, 20, {
    sort: '-created'
  });
  return records.items;
}
