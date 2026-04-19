import { Station, WindowStatus, Notification } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-cache",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.console.error ?? `${path} failed`);
  }

  return res.json();
}

export const api = {
  stations: () => req<Station[]>("/api/stations"),
  window: () => req<WindowStatus>("/api/stations/window/"),
  notifications: () => req<Notification[]>("/api/notifications"),
  markRead: (id: number) =>
    req(`/api/notifications/${id}/read`, { method: "PATCH" }),
  submit: (station_id: string, raw_synop: string) =>
    req("/api/stations/submit/", {
      method: "POST",
      body: JSON.stringify({ station_id, raw_synop }),
    }),
};
