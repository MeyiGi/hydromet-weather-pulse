import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { getDeviceId } from "@/lib/deviceId";
import type { AppNotification } from "@/lib/types";

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [unread, setUnread] = useState(0);
  const deviceIdRef = useRef<string | null>(null);

  const getOrLoadDeviceId = useCallback(async () => {
    if (!deviceIdRef.current) {
      deviceIdRef.current = await getDeviceId();
    }
    return deviceIdRef.current;
  }, []);

  const load = useCallback(async (p: number, ps: number) => {
    try {
      const deviceId = await getOrLoadDeviceId();
      const data = await api.notifications(deviceId, { page: p, page_size: ps });
      setItems(data.results ?? []);
      setTotalPages(data.total_pages ?? 1);
      setUnread(data.unread_count ?? 0);
    } catch {
      // keep last state
    }
  }, [getOrLoadDeviceId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(page, pageSize);
    setRefreshing(false);
  }, [load, page, pageSize]);

  const markRead = useCallback(async (id: number) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnread((c) => Math.max(0, c - 1));
    try {
      const deviceId = await getOrLoadDeviceId();
      await api.markRead(id, deviceId);
    } catch {
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: false } : n));
      setUnread((c) => c + 1);
    }
  }, [getOrLoadDeviceId]);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      const deviceId = await getOrLoadDeviceId();
      await api.markAllRead(deviceId);
    } catch {}
  }, [getOrLoadDeviceId]);

  useEffect(() => {
    load(page, pageSize);
    const interval = setInterval(() => load(page, pageSize), 20_000);
    return () => clearInterval(interval);
  }, [load, page, pageSize]);

  const handlePageSize = useCallback((s: number) => {
    setPageSize(s);
    setPage(1);
  }, []);

  return {
    items,
    markRead,
    markAllRead,
    unread,
    refreshing,
    onRefresh,
    page,
    setPage,
    totalPages,
    pageSize,
    setPageSize: handlePageSize,
  };
}
