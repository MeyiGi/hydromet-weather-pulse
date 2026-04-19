const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const tokenKey = (id: string) => `station_token:${id}`;

export async function unlockStation(id: string, password: string): Promise<string | null> {
  const res = await fetch(`${BASE}/api/stations/${id}/auth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return null;
  const { token } = await res.json();
  sessionStorage.setItem(tokenKey(id), token);
  return token;
}

export const getToken = (id: string): string | null =>
  typeof window !== "undefined" ? sessionStorage.getItem(tokenKey(id)) : null;

export const isUnlocked = (id: string): boolean => getToken(id) !== null;

export const lock = (id: string) => sessionStorage.removeItem(tokenKey(id));
