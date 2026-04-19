"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useStations } from "@/hooks/useStation";
import { useWindowStatus } from "@/hooks/useWindowStatus";
import { isUnlocked, lock } from "@/lib/auth";
import { relativeTime } from "@/lib/format";
import { SubmitForm } from "@/components/SubmitForm";
import { StationLoginDialog } from "@/components/StationLoginDialog";
import { WindowStatusCard } from "@/components/StationStatusCard";
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
import { MapPin, Clock, Lock } from "lucide-react";

export default function StationPage({
  params,
}: {
  params: Promise<{ stationId: string }>;
}) {
  const { stationId } = use(params);
  const { stations } = useStations();
  const { status } = useWindowStatus();
  const station = stations?.find((s) => s.station_id === stationId);

  const [unlocked, setUnlocked] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setUnlocked(isUnlocked(stationId));
  }, [stationId]);

  // Станция не найдена (только после того как список загрузился)
  if (stations && !station)
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <p className="mb-4 text-muted-foreground">Station not found.</p>
        <Link href="/">
          <Button variant="outline" className="rounded-xl">
            Back to stations
          </Button>
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Stations</BreadcrumbLink>
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
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {/* Инфо о станции */}
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
                <div>
                  <CardTitle className="text-base">{station.name}</CardTitle>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {station.station_id}
                  </p>
                </div>
                <Badge
                  variant={station.is_overdue ? "destructive" : "secondary"}
                  className="rounded-full font-normal"
                >
                  {station.is_overdue ? "overdue" : "on time"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {station.location && (
                <>
                  <div className="flex items-center gap-2 py-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {station.location}
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center gap-2 py-2">
                <Clock className="h-3.5 w-3.5" /> last seen:{" "}
                {relativeTime(station.last_seen)}
              </div>
            </CardContent>
          </Card>
        )}

        <WindowStatusCard />

        {/* Форма или кнопка разблокировки */}
        {unlocked ? (
          <SubmitForm
            stationId={stationId}
            windowOpen={!!status?.is_open}
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
                Only the station operator can submit readings.
              </p>
              <Button
                onClick={() => setLoginOpen(true)}
                className="h-11 rounded-xl"
              >
                Unlock station
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
