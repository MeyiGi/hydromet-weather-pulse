"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";

// Возвращает уведомления + функцию markRead с оптимистичным обновлением
export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.notifications();
        if (active) setItems(data);
      } catch {}
    };
    load();
    const id = setInterval(load, 20_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Оптимистично: сразу меняем UI, потом отправляем на сервер
  const markRead = async (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    await api.markRead(id).catch(() => {});
  };

  return {
    items,
    markRead,
    unread: items.filter((n) => !n.is_read).length,
  };
}
