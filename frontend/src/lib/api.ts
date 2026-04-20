import { Station, PaginatedStations, WindowStatus, Notification } from "./types";
import { getToken, getDeviceId } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-cache",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `${path} failed`);
  }

  return res.json();
}

export const api = {
  stations: (params?: { page?: number; page_size?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.page_size) qs.set("page_size", String(params.page_size));
    if (params?.status) qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString();
    return req<PaginatedStations>(`/api/stations${query ? `?${query}` : ""}`);
  },
  window: () => req<WindowStatus>("/api/stations/window/"),
  notifications: () => {
    const deviceId = getDeviceId();
    const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
    return req<Notification[]>(`/api/notifications${qs}`);
  },
  markRead: (id: number) =>
    req(`/api/notifications/${id}/read/`, {
      method: "PATCH",
      body: JSON.stringify({ device_id: getDeviceId() }),
    }),
  markAllRead: () =>
    req(`/api/notifications/read-all/`, {
      method: "PATCH",
      body: JSON.stringify({ device_id: getDeviceId() }),
    }),
  submit: (station_id: string, raw_synop: string) => {
    const token = getToken(station_id);
    return req("/api/stations/submit/", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ station_id, raw_synop }),
    });
  },
};
