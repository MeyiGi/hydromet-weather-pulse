"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async (p: number, ps: number) => {
    try {
      const data = await api.notifications({ page: p, page_size: ps });
      setItems(data.results ?? []);
      setTotalPages(data.total_pages ?? 1);
      setUnread(data.unread_count);
    } catch {}
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await load(page, pageSize);
    };
    run();
    const id = setInterval(run, 20_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [page, pageSize, load]);

  const markRead = async (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnread((c) => Math.max(0, c - 1));
    await api.markRead(id).catch(() => {});
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    await api.markAllRead().catch(() => {});
  };

  const handlePageSize = (s: number) => { setPageSize(s); setPage(1); };

  return {
    items,
    markRead,
    markAllRead,
    unread,
    page,
    setPage,
    pageSize,
    setPageSize: handlePageSize,
    totalPages,
  };
}
