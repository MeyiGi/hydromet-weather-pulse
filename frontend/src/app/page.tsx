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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";

type Filter = "all" | "onTime" | "overdue";

export default function Home() {
  const { t } = useLang();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  const statusParam =
    filter === "onTime" ? "on_time" : filter === "overdue" ? "overdue" : undefined;

  const { stations, totalPages, total, error, loading } = useStations({
    page,
    page_size: pageSize,
    search,
    status: statusParam,
  });

  const withCoords = (stations ?? []).filter(
    (s) => s.latitude !== null && s.longitude !== null
  );

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (f: Filter) => { setFilter(f); setPage(1); setFilterOpen(false); };

  const handlePageSize = (s: number) => { setPageSize(s); setPage(1); setPageSizeOpen(false); };

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
          <section className="isolate">
            <StationMap stations={withCoords} onNavigate={(id) => router.push(`/stations/${id}`)} />
          </section>
        )}
        <section>
          {/* Search row */}
          <div className="mb-2 relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-8 w-full rounded-xl pl-8 text-sm"
            />
          </div>

          {/* Toolbar: title + filters left, pagination right */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-normal text-muted-foreground">
                {t("stations")}
                {total > 0 && <span className="ml-1.5 text-muted-foreground/60">({total})</span>}
              </h2>

              {/* Status filter dropdown */}
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl px-3 text-xs font-normal">
                    {filter === "all" ? t("filterAll") : filter === "onTime" ? t("onTime") : t("overdue")}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-36 p-1">
                  {(["all", "onTime", "overdue"] as Filter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => handleFilter(f)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      {f === "all" ? t("filterAll") : f === "onTime" ? t("onTime") : t("overdue")}
                      {filter === f && <Check className="h-3.5 w-3.5 text-foreground" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Per-page dropdown */}
              <Popover open={pageSizeOpen} onOpenChange={setPageSizeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl px-3 text-xs font-normal tabular-nums">
                    {pageSize}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-28 p-1">
                  {[10, 20, 50, 100].map((s) => (
                    <button
                      key={s}
                      onClick={() => handlePageSize(s)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      {s}
                      {pageSize === s && <Check className="h-3.5 w-3.5 text-foreground" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Pagination — right side */}
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

          <StationGrid stations={stations} error={error} loading={loading} />

          {/* Bottom pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1">
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
        </section>
      </main>
    </div>
  );
}
