import { hasDatabaseUrl } from "../db/client.js";
import { dbStore } from "./dbStore.js";
import { memoryStore } from "./memoryStore.js";

export type Store = typeof memoryStore | typeof dbStore;

export function getStore(): Store {
  return hasDatabaseUrl() ? dbStore : memoryStore;
}

export function storeMode() {
  return hasDatabaseUrl() ? "database" : "memory";
}
