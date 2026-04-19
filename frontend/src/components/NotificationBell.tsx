"use client";
import { useNotifications } from "@/hooks/useNotification";
import { useLang } from "@/lib/i18n";
import { Bell, Check, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { relativeTime } from "@/lib/format";
import type { Notification } from "@/lib/types";

const icon = { info: Info, warning: AlertTriangle, error: AlertCircle };
const color = {
  info: "text-muted-foreground",
  warning: "text-amber-500",
  error: "text-destructive",
};

export function NotificationsBell() {
  const { items, markRead, unread } = useNotifications();
  const { t } = useLang();

  return (
    <Popover>
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

      <PopoverContent align="end" className="w-80 rounded-2xl p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-medium">{t("notifications")}</p>
          {unread > 0 && (
            <span className="text-xs text-muted-foreground">
              {unread} {t("unread")}
            </span>
          )}
        </div>
        <Separator />

        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              {t("nothingHereYet")}
            </p>
          ) : (
            items.map((n: Notification, i) => {
              const Icon = icon[n.level];
              return (
                <div key={n.id}>
                  <div
                    className={`flex gap-3 px-4 py-3 ${!n.is_read ? "bg-muted/40" : ""}`}
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${color[n.level]}`}
                    />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => markRead(n.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  {i < items.length - 1 && <Separator />}
                </div>
              );
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
