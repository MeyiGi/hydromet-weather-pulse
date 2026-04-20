import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const tokenKey = (id: string) => `station_token_${id.replace(/[^a-zA-Z0-9]/g, "_")}`;

async function storeGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function storeSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") { localStorage.setItem(key, value); return; }
  await SecureStore.setItemAsync(key, value);
}

async function storeDelete(key: string): Promise<void> {
  if (Platform.OS === "web") { localStorage.removeItem(key); return; }
  await SecureStore.deleteItemAsync(key);
}

export async function unlockStation(id: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/api/stations/${id}/auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    await storeSet(tokenKey(id), token);
    return token;
  } catch {
    return null;
  }
}

export async function getToken(id: string): Promise<string | null> {
  return storeGet(tokenKey(id));
}

export async function isUnlocked(id: string): Promise<boolean> {
  const t = await getToken(id);
  return t !== null;
}

export async function lock(id: string): Promise<void> {
  await storeDelete(tokenKey(id));
}
