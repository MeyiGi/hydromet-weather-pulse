import { PaginatedStations, WindowStatus, AppNotification } from "./types";
import { getToken } from "./auth";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
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
  notifications: (deviceId: string) =>
    req<AppNotification[]>(`/api/notifications/?device_id=${encodeURIComponent(deviceId)}`),
  markRead: (id: number, deviceId: string) =>
    req(`/api/notifications/${id}/read/`, {
      method: "PATCH",
      body: JSON.stringify({ device_id: deviceId }),
    }),
  registerToken: (token: string) =>
    req("/api/notifications/token/", {
      method: "POST",
      body: JSON.stringify({ token, token_type: "expo" }),
    }),
  submit: async (station_id: string, raw_synop: string) => {
    const token = await getToken(station_id);
    return req("/api/stations/submit/", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ station_id, raw_synop }),
    });
  },
};
