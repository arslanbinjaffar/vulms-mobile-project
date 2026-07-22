import { Platform } from "react-native";

const memory = new Map<string, string>();

function storage() {
  if (Platform.OS === "web" && globalThis.localStorage) return globalThis.localStorage;
  return null;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = storage()?.getItem(key) ?? memory.get(key) ?? null;
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  storage()?.setItem(key, raw);
}

export async function cacheClear(prefix?: string) {
  if (!prefix) {
    memory.clear();
    storage()?.clear();
    return;
  }
  for (const key of [...memory.keys()]) {
    if (key.startsWith(prefix)) memory.delete(key);
  }
  const s = storage();
  if (!s) return;
  for (let i = s.length - 1; i >= 0; i--) {
    const key = s.key(i);
    if (key?.startsWith(prefix)) s.removeItem(key);
  }
}
