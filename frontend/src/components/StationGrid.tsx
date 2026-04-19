"use client";
import { useLang } from "@/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { StationCard } from "./StationCard";
import type { Station } from "@/lib/types";

interface Props {
  stations: Station[] | null;
  error?: string | null;
}

export function StationGrid({ stations, error }: Props) {
  const { t } = useLang();

  if (error)
    return (
      <Alert variant="destructive" className="rounded-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("couldNotLoad")}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );

  if (!stations)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );

  if (!stations.length)
    return (
      <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        {t("noStationsYet")}
      </p>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stations.map((s) => (
        <StationCard key={s.station_id} station={s} />
      ))}
    </div>
  );
}
