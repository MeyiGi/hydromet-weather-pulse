"use client";
import { useEffect, useRef } from "react";
import type { Station } from "@/lib/types";

interface Props {
  stations: Station[];
}

function addMarkers(L: typeof import("leaflet"), map: import("leaflet").Map, stations: Station[]) {
  stations
    .filter((s) => s.latitude !== null && s.longitude !== null)
    .forEach((s) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${
          s.is_overdue ? "#ef4444" : "#22c55e"
        };border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker([s.latitude!, s.longitude!], { icon })
        .addTo(map)
        .bindPopup(
          `<b>${s.name}</b><br>${s.station_id}<br>${s.location ?? ""}` +
            `<br><span style="color:${s.is_overdue ? "#ef4444" : "#22c55e"}">` +
            `${s.is_overdue ? "Overdue" : "On time"}</span>`
        );
    });
}

export function StationMap({ stations }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !container) return;
      // Guard against double-init (React Strict Mode)
      if ((container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) return;

      // @ts-expect-error leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(container).setView([48, 68], 4);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      addMarkers(L, map, stations);

      const withCoords = stations.filter(
        (s) => s.latitude !== null && s.longitude !== null
      );
      if (withCoords.length > 0) {
        map.fitBounds(
          L.latLngBounds(withCoords.map((s) => [s.latitude!, s.longitude!])),
          { padding: [40, 40] }
        );
      }
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh markers when station data updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    import("leaflet").then((L) => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });
      addMarkers(L, map, stations);
    });
  }, [stations]);

  return (
    <div
      ref={containerRef}
      className="h-[400px] w-full rounded-2xl overflow-hidden border"
    />
  );
}
