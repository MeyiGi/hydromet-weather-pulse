"use client";
import { useState } from "react";
import { StationGrid } from "@/components/StationGrid";
import { StationMap } from "@/components/StationMap";
import { WindowStatusCard } from "@/components/StationStatusCard";
import { HeaderControls } from "@/components/HeaderControls";
import { useLang } from "@/lib/i18n";
import { useStations } from "@/hooks/useStation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Filter = "all" | "onTime" | "overdue";

export default function Home() {
  const { t } = useLang();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizeInput, setPageSizeInput] = useState("10");

  const statusParam =
    filter === "onTime" ? "active" : filter === "overdue" ? "overdue" : "active";

  const { stations, totalPages, total, error } = useStations({
    page,
    page_size: pageSize,
    search,
    status: statusParam,
  });

  const withCoords = (stations ?? []).filter(
    (s) => s.latitude !== null && s.longitude !== null
  );

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (f: Filter) => { setFilter(f); setPage(1); };

  const applyPageSize = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1) {
      const clamped = Math.min(n, 1000);
      setPageSize(clamped);
      setPageSizeInput(String(clamped));
      setPage(1);
    } else {
      setPageSizeInput(String(pageSize));
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-base font-medium tracking-tight sm:text-lg">SynopNet</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">{t("appSubtitle")}</p>
          </div>
          <HeaderControls />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <WindowStatusCard />
        {withCoords.length > 0 && (
          <section>
            <StationMap stations={withCoords} onNavigate={(id) => router.push(`/stations/${id}`)} />
          </section>
        )}
        <section>
          {/* Toolbar — search, filters, per-page, pagination all in one row */}
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-normal text-muted-foreground">
              {t("stations")}
              {total > 0 && <span className="ml-1.5 text-muted-foreground/60">({total})</span>}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-8 w-48 rounded-xl pl-8 text-sm sm:w-56"
                />
              </div>

              {/* Status filters */}
              <div className="flex gap-1">
                {(["all", "onTime", "overdue"] as Filter[]).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? "default" : "ghost"}
                    className="h-8 rounded-xl px-3 text-xs font-normal"
                    onClick={() => handleFilter(f)}
                  >
                    {f === "all" ? t("filterAll") : f === "onTime" ? t("onTime") : t("overdue")}
                  </Button>
                ))}
              </div>

              {/* Per-page input */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">per page</span>
                <Input
                  type="number"
                  min={1}
                  value={pageSizeInput}
                  onChange={(e) => setPageSizeInput(e.target.value)}
                  onBlur={() => applyPageSize(pageSizeInput)}
                  onKeyDown={(e) => e.key === "Enter" && applyPageSize(pageSizeInput)}
                  className="h-8 w-16 rounded-xl text-center text-sm tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              {/* Prev / page indicator / next */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 rounded-xl p-0"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[4rem] text-center text-xs text-muted-foreground tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 rounded-xl p-0"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <StationGrid stations={stations} error={error} />
        </section>
      </main>
    </div>
  );
}
