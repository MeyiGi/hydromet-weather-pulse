"use client";
import { useState, useMemo } from "react";
import { StationGrid } from "@/components/StationGrid";
import { StationMap } from "@/components/StationMap";
import { WindowStatusCard } from "@/components/StationStatusCard";
import { HeaderControls } from "@/components/HeaderControls";
import { useLang } from "@/lib/i18n";
import { useStations } from "@/hooks/useStation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

type Filter = "all" | "onTime" | "overdue";

export default function Home() {
  const { t } = useLang();
  const { stations, error } = useStations();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const withCoords = (stations ?? []).filter(
    (s) => s.latitude !== null && s.longitude !== null
  );

  const filtered = useMemo(() => {
    if (!stations) return null;
    const q = search.trim().toLowerCase();
    return stations.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.station_id.toLowerCase().includes(q) ||
        (s.location ?? "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "onTime" && !s.is_overdue) ||
        (filter === "overdue" && s.is_overdue);
      return matchesSearch && matchesFilter;
    });
  }, [stations, search, filter]);

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
            <StationMap
            stations={withCoords}
            onNavigate={(id) => router.push(`/stations/${id}`)}
          />
          </section>
        )}
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-normal text-muted-foreground">
              {t("stations")}
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-8 w-48 rounded-xl pl-8 text-sm sm:w-56"
                />
              </div>
              <div className="flex gap-1">
                {(["all", "onTime", "overdue"] as Filter[]).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? "default" : "ghost"}
                    className="h-8 rounded-xl px-3 text-xs font-normal"
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? t("filterAll") : f === "onTime" ? t("onTime") : t("overdue")}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <StationGrid stations={filtered} error={error} />
        </section>
      </main>
    </div>
  );
}
