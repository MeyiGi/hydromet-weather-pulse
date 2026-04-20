"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { relativeTime } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import type { Station } from "@/lib/types";

export function StationCard({ station }: { station: Station }) {
  const { t, lang } = useLang();

  return (
    <Link href={`/stations/${station.station_id}`} className="group block">
      <Card className="rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="min-w-0 flex-1 pr-2">
            <CardTitle className="truncate text-base font-medium">
              {station.name}
            </CardTitle>
            <p className="font-mono text-xs text-muted-foreground">
              {station.station_id}
            </p>
          </div>
          <Badge
            variant={
              station.submission_status === "overdue"
                ? "destructive"
                : station.submission_status === "pending"
                ? "outline"
                : "secondary"
            }
            className={`shrink-0 rounded-full font-normal ${
              station.submission_status === "pending"
                ? "border-amber-400 text-amber-600 dark:border-amber-500 dark:text-amber-400"
                : ""
            }`}
          >
            {station.submission_status === "overdue"
              ? t("overdue")
              : station.submission_status === "pending"
              ? t("pending")
              : t("onTime")}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          {station.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{station.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {t("lastSeen")}: {relativeTime(station.last_seen, lang)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
