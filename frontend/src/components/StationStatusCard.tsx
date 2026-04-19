"use client";
import { useWindowStatus } from "@/hooks/useWindowStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio } from "lucide-react";
import { countdown, utcHour } from "@/lib/format";

const WINDOW_SECONDS = 20 * 60; // окно = 20 минут

export function WindowStatusCard() {
  const { status } = useWindowStatus();

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">
            Submission window
          </CardTitle>
        </div>
        {status ? (
          <Badge
            variant={status.is_open ? "default" : "secondary"}
            className="rounded-full font-normal"
          >
            {status.is_open ? "open" : "closed"}
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
                <p className="text-xs text-muted-foreground">closes in</p>
                <p className="text-3xl font-semibold tabular-nums">
                  {countdown(status.current.seconds_left)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {utcHour(status.current.hour)}
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
              <p className="text-xs text-muted-foreground">opens in</p>
              <p className="text-3xl font-semibold tabular-nums">
                {countdown(status.next.opens_in_seconds)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              next {utcHour(status.next.hour)}
            </p>
          </div>
        )}

        <Separator />

        {/* Все 8 окон UTC */}
        <div className="flex flex-wrap gap-1.5">
          {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
            <Badge
              key={h}
              variant={
                status?.is_open && status.current?.hour === h
                  ? "default"
                  : "outline"
              }
              className="rounded-full font-mono text-[11px] font-normal"
            >
              {utcHour(h)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
