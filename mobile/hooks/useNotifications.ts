import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { getDeviceId } from "@/lib/deviceId";
import type { AppNotification } from "@/lib/types";

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const deviceIdRef = useRef<string | null>(null);

  const getOrLoadDeviceId = useCallback(async () => {
    if (!deviceIdRef.current) {
      deviceIdRef.current = await getDeviceId();
    }
    return deviceIdRef.current;
  }, []);

  const load = useCallback(async () => {
    try {
      const deviceId = await getOrLoadDeviceId();
      const data = await api.notifications(deviceId);
      setItems(data);
    } catch {
      // keep last state
    }
  }, [getOrLoadDeviceId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const markRead = useCallback(async (id: number) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    try {
      const deviceId = await getOrLoadDeviceId();
      await api.markRead(id, deviceId);
    } catch {
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: false } : n));
    }
  }, [getOrLoadDeviceId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20_000);
    return () => clearInterval(interval);
  }, [load]);

  const unread = items.filter((n) => !n.is_read).length;

  return { items, markRead, unread, refreshing, onRefresh };
}
