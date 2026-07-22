import Constants from "expo-constants";
import { Platform } from "react-native";

function resolveApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  if (typeof fromExtra === "string" && fromExtra.length > 0) {
    return fromExtra.replace(/\/$/, "");
  }

  if (Platform.OS === "android") return "http://10.0.2.2:8788";
  return "http://localhost:8788";
}

export const API_URL = resolveApiUrl();

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(body?.error ?? body?.message ?? res.statusText, res.status, body);
  }
  return body as T;
}
