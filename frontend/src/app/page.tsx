"use client";
import { StationGrid } from "@/components/StationGrid";
import { StationMap } from "@/components/StationMap";
import { WindowStatusCard } from "@/components/StationStatusCard";
import { HeaderControls } from "@/components/HeaderControls";
import { useLang } from "@/lib/i18n";
import { useStations } from "@/hooks/useStation";

export default function Home() {
  const { t } = useLang();
  const { stations, error } = useStations();

  const withCoords = (stations ?? []).filter(
    (s) => s.latitude !== null && s.longitude !== null
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-base font-medium tracking-tight sm:text-lg">
              SynopNet
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {t("appSubtitle")}
            </p>
          </div>
          <HeaderControls />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <WindowStatusCard />
        {withCoords.length > 0 && (
          <section>
            <StationMap stations={withCoords} />
          </section>
        )}
        <section>
          <h2 className="mb-3 text-sm font-normal text-muted-foreground">
            {t("stations")}
          </h2>
          <StationGrid stations={stations} error={error} />
        </section>
      </main>
    </div>
  );
}
