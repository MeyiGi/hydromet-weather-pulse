"use client";
import { useEffect, useRef } from "react";

interface Props {
  lat: number;
  lng: number;
  name: string;
  submissionStatus: "on_time" | "pending" | "overdue";
}

export function StationMiniMap({ lat, lng, name, submissionStatus }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !container) return;
      if ((container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) return;

      // @ts-expect-error leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;

      const map = L.map(container, { zoomControl: true, attributionControl: false })
        .setView([lat, lng], 10);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${
          submissionStatus === "overdue" ? "#ef4444" : submissionStatus === "pending" ? "#f59e0b" : "#22c55e"
        };border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([lat, lng], { icon }).addTo(map).bindPopup(name).openPopup();
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="h-[220px] w-full overflow-hidden rounded-2xl border"
    />
  );
}
