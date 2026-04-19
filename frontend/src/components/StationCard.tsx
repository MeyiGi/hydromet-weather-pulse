import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { relativeTime } from "@/lib/format";
import type { Station } from "@/lib/types";

// Чисто presentational — только UI, никакого fetch
export function StationCard({ station }: { station: Station }) {
  return (
    <Link href={`/stations/${station.station_id}`} className="group block">
      <Card className="rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">
              {station.name}
            </CardTitle>
            <p className="font-mono text-xs text-muted-foreground">
              {station.station_id}
            </p>
          </div>
          <Badge
            variant={station.is_overdue ? "destructive" : "secondary"}
            className="rounded-full font-normal"
          >
            {station.is_overdue ? "overdue" : "on time"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          {station.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> {station.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> last seen:{" "}
            {relativeTime(station.last_seen)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
