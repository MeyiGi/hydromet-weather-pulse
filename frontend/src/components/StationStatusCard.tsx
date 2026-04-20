"use client";
import { useWindowStatus } from "@/hooks/useWindowStatus";
import { useLang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio } from "lucide-react";
import { countdown, localHour } from "@/lib/format";

const WINDOW_SECONDS = 20 * 60;
const WINDOWS = [0, 3, 6, 9, 12, 15, 18, 21];

function windowState(
  h: number,
  status: ReturnType<typeof useWindowStatus>["status"],
): "active" | "next" | "past" | "upcoming" {
  if (status?.is_open && status.current?.hour === h) return "active";
  if (status?.next?.hour === h) return "next";

  // determine if this window has already closed today
  const now = new Date();
  const windowClose = h * 60 + 20; // minutes past midnight UTC
  const nowUtc = now.getUTCHours() * 60 + now.getUTCMinutes();
  if (nowUtc >= windowClose && !(status?.is_open && status.current?.hour === h)) {
    // check it's not the next-day wraparound (e.g. 21 UTC < next window 0 UTC)
    if (status?.next?.hour !== undefined && h !== status.next.hour) {
      const nextClose = status.next.hour * 60 + 20;
      if (nextClose > windowClose || nowUtc < nextClose) return "past";
    } else {
      return "past";
    }
  }

  return "upcoming";
}

export function WindowStatusCard() {
  const { status } = useWindowStatus();
  const { t } = useLang();

  const sorted = WINDOWS.slice().sort((a, b) => {
    const toLocal = (utcH: number) => {
      const d = new Date();
      d.setUTCHours(utcH, 0, 0, 0);
      return d.getHours() * 60 + d.getMinutes();
    };
    return toLocal(a) - toLocal(b);
  });

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {t("submissionWindow")}
          </CardTitle>
        </div>
        {status ? (
          <Badge
            variant={status.is_open ? "default" : "secondary"}
            className="rounded-full font-normal"
          >
            {status.is_open ? t("open") : t("closed")}
          </Badge>
        ) : (
          <Skeleton className="h-5 w-14 rounded-full" />
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!status && <Skeleton className="h-10 w-32 rounded-lg" />}

        {status?.is_open && status.current && (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t("closesIn")}</p>
                <p className="text-3xl font-light tabular-nums tracking-wide">
                  {countdown(status.current.seconds_left)}
                </p>
              </div>
              <p className="text-xs font-medium tabular-nums text-foreground">
                {localHour(status.current.hour)}
              </p>
            </div>
            <Progress
              value={Math.round(
                (status.current.seconds_left / WINDOW_SECONDS) * 100,
              )}
              className="h-1.5"
            />
          </>
        )}

        {status && !status.is_open && status.next && (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t("opensIn")}</p>
              <p className="text-3xl font-light tabular-nums tracking-wide">
                {countdown(status.next.opens_in_seconds)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("nextWindow")}{" "}
              <span className="font-medium tabular-nums text-foreground">
                {localHour(status.next.hour)}
              </span>
            </p>
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-1.5">
          {sorted.map((h) => {
            const state = windowState(h, status);
            return (
              <Badge
                key={h}
                variant="outline"
                className={[
                  "rounded-full font-mono text-[11px] font-normal tabular-nums transition-opacity",
                  state === "active"
                    ? "border-transparent bg-foreground text-background"
                    : state === "next"
                      ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300"
                      : state === "past"
                        ? "opacity-25"
                        : "opacity-60",
                ].join(" ")}
              >
                {localHour(h)}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
