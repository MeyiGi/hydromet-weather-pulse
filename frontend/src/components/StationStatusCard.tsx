"use client";
import { useWindowStatus } from "@/hooks/useWindowStatus";
import { useLang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio } from "lucide-react";
import { countdown, localHour, utcHour } from "@/lib/format";

const WINDOW_SECONDS = 20 * 60;

export function WindowStatusCard() {
  const { status } = useWindowStatus();
  const { t } = useLang();

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
              <p className="text-xs text-muted-foreground">
                {localHour(status.current.hour)}{" "}
                <span className="opacity-60">({utcHour(status.current.hour)} UTC)</span>
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
              {t("nextWindow")} {localHour(status.next.hour)}{" "}
              <span className="opacity-60">({utcHour(status.next.hour)} UTC)</span>
            </p>
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-1.5">
          {[0, 3, 6, 9, 12, 15, 18, 21]
            .slice()
            .sort((a, b) => {
              const toLocal = (utcH: number) => {
                const d = new Date();
                d.setUTCHours(utcH, 0, 0, 0);
                return d.getHours() * 60 + d.getMinutes();
              };
              return toLocal(a) - toLocal(b);
            })
            .map((h) => (
            <Badge
              key={h}
              variant={
                status?.is_open && status.current?.hour === h
                  ? "default"
                  : "outline"
              }
              className="rounded-full font-mono text-[11px] font-normal"
            >
              {localHour(h)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
