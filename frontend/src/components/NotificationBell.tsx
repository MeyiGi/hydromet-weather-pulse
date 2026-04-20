"use client";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotification";
import { useLang } from "@/lib/i18n";
import {
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { relativeTime } from "@/lib/format";
import type { Notification } from "@/lib/types";

const icon = { info: Info, warning: AlertTriangle, error: AlertCircle };
const color = {
  info: "text-muted-foreground",
  warning: "text-amber-500",
  error: "text-destructive",
};

const PAGE_SIZES = [10, 20, 50, 100];

export function NotificationsBell() {
  const {
    items,
    markAllRead,
    unread,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
  } = useNotifications();
  const { t } = useLang();
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  const handleOpen = (open: boolean) => {
    if (open && unread > 0) markAllRead();
  };

  const PaginationRow = () => (
    <div className="flex items-center justify-center gap-1 py-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-12 text-center text-xs text-muted-foreground tabular-nums">
        {page} / {totalPages}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4 min-w-[16px] rounded-full px-1 text-[10px]"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 rounded-2xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-medium">{t("notifications")}</p>
          <Popover open={pageSizeOpen} onOpenChange={setPageSizeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-lg px-2 text-xs font-normal tabular-nums"
              >
                {pageSize}
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-24 p-1">
              {PAGE_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setPageSize(s); setPageSizeOpen(false); }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-accent"
                >
                  {s}
                  {pageSize === s && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Top pagination */}
        {totalPages > 1 && (
          <>
            <Separator />
            <PaginationRow />
          </>
        )}

        <Separator />

        {/* List */}
        <div className="max-h-[55vh] overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              {t("nothingHereYet")}
            </p>
          ) : (
            items.map((n: Notification, i) => {
              const Icon = icon[n.level];
              return (
                <div key={n.id}>
                  <div className="flex gap-3 px-4 py-3 min-w-0">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color[n.level]}`} />
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground break-words">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                  {i < items.length - 1 && <Separator />}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom pagination */}
        {totalPages > 1 && (
          <>
            <Separator />
            <PaginationRow />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
