import { StationGrid } from "@/components/StationGrid";
import { WindowStatusCard } from "@/components/StationStatusCard";
import { NotificationsBell } from "@/components/NotificationBell";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">SynopNet</h1>
            <p className="text-xs text-muted-foreground">
              Kyrgyzstan weather stations
            </p>
          </div>
          <NotificationsBell />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <WindowStatusCard />
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Stations
          </h2>
          <StationGrid />
        </section>
      </main>
    </div>
  );
}
