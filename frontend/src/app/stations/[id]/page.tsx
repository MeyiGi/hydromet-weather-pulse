"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useStations } from "@/hooks/useStation";
import { useWindowStatus } from "@/hooks/useWindowStatus";
import { isUnlocked, lock } from "@/lib/auth";
import { relativeTime, countdown } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { SubmitForm } from "@/components/SubmitForm";
import { StationLoginDialog } from "@/components/StationLoginDialog";
import { WindowStatusCard } from "@/components/StationStatusCard";
import { HeaderControls } from "@/components/HeaderControls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MapPin, Clock, Lock, Timer } from "lucide-react";
import { StationMiniMap } from "@/components/StationMiniMap";

export default function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: stationId } = use(params);
  const { stations } = useStations();
  const { status } = useWindowStatus();
  const { t } = useLang();
  const station = stations?.find((s) => s.station_id === stationId);

  const [unlocked, setUnlocked] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setUnlocked(isUnlocked(stationId));
  }, [stationId]);

  if (stations && !station)
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <p className="mb-4 text-muted-foreground">{t("stationNotFound")}</p>
        <Link href="/">
          <Button variant="outline" className="rounded-xl font-normal">
            {t("backToStations")}
          </Button>
        </Link>
      </div>
    );

  const windowOpen = !!status?.is_open;
  const opensIn = status && !status.is_open && status.next
    ? status.next.opens_in_seconds
    : null;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("stations")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {station ? (
                  <BreadcrumbPage>{station.name}</BreadcrumbPage>
                ) : (
                  <Skeleton className="h-4 w-28 rounded" />
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <HeaderControls />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {/* Station info */}
        {!station ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
              <Separator />
              <Skeleton className="h-3 w-32 rounded" />
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base font-medium">
                    {station.name}
                  </CardTitle>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {station.station_id}
                  </p>
                </div>
                <Badge
                  variant={station.is_overdue ? "destructive" : "secondary"}
                  className="shrink-0 rounded-full font-normal"
                >
                  {station.is_overdue ? t("overdue") : t("onTime")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {station.location && (
                <>
                  <div className="flex items-center gap-2 py-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{station.location}</span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center gap-2 py-2">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {t("lastSeen")}: {relativeTime(station.last_seen)}
              </div>
            </CardContent>
          </Card>
        )}

        {station?.latitude != null && station?.longitude != null && (
          <StationMiniMap
            lat={station.latitude}
            lng={station.longitude}
            name={station.name}
            isOverdue={station.is_overdue}
          />
        )}

        <WindowStatusCard />

        {/* Window closed notice */}
        {status && !windowOpen && (
          <Card className="rounded-2xl border-amber-200 bg-amber-50 shadow-none dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardContent className="flex items-center gap-3 py-4">
              <Timer className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t("windowClosed")}
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                  {t("windowClosedDesc")}
                  {opensIn !== null && (
                    <> &nbsp;&mdash;&nbsp;{countdown(opensIn)}</>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form or unlock */}
        {unlocked ? (
          <SubmitForm
            stationId={stationId}
            windowOpen={windowOpen}
            onLock={() => {
              lock(stationId);
              setUnlocked(false);
            }}
          />
        ) : (
          <Card className="rounded-2xl border-dashed shadow-none">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("onlyOperator")}
              </p>
              <Button
                onClick={() => setLoginOpen(true)}
                className="h-11 rounded-xl font-normal"
              >
                {t("unlockStation")}
              </Button>
            </CardContent>
          </Card>
        )}

        <StationLoginDialog
          stationId={stationId}
          stationName={station?.name ?? stationId}
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onUnlocked={() => {
            setUnlocked(true);
            setLoginOpen(false);
          }}
        />
      </main>
    </div>
  );
}
