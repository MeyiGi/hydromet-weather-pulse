import { createContext, useContext, type ReactNode } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import type { AppNotification } from "@/lib/types";

interface NotificationsContextValue {
  items: AppNotification[];
  unread: number;
  refreshing: boolean;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  onRefresh: () => Promise<void>;
  page: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  totalPages: number;
  pageSize: number;
  setPageSize: (s: number) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const value = useNotifications();
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsContext must be used within NotificationsProvider");
  return ctx;
}
