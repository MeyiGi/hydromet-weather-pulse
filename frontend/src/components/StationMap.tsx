"use client";
import { useEffect, useRef } from "react";
import type { Station } from "@/lib/types";

interface Props {
  stations: Station[];
  onNavigate?: (stationId: string) => void;
}

function addMarkers(
  L: typeof import("leaflet"),
  map: import("leaflet").Map,
  stations: Station[],
  onNavigate?: (id: string) => void,
) {
  stations
    .filter((s) => s.latitude !== null && s.longitude !== null)
    .forEach((s) => {
      const color = s.submission_status === "overdue" ? "#ef4444" : s.submission_status === "pending" ? "#f59e0b" : "#22c55e";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -10],
      });

      const popup = L.popup({ closeButton: false, className: "station-popup" }).setContent(`
        <div style="min-width:140px;cursor:pointer;padding:2px 0">
          <div style="font-weight:600;font-size:13px;margin-bottom:2px">${s.name}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:6px">${s.location ?? s.station_id}</div>
          <div style="font-size:11px;color:${color};margin-bottom:6px">${s.submission_status === "overdue" ? "● Overdue" : s.submission_status === "pending" ? "● Pending" : "● On time"}</div>
          <div style="font-size:11px;color:#3b82f6;font-weight:500">Open station →</div>
        </div>
      `);

      const marker = L.marker([s.latitude!, s.longitude!], { icon }).addTo(map).bindPopup(popup);

      if (onNavigate) {
        marker.on("popupopen", () => {
          const el = marker.getPopup()?.getElement();
          if (el) {
            el.style.cursor = "pointer";
            el.onclick = () => onNavigate(s.station_id);
          }
        });
      }
    });
}

export function StationMap({ stations, onNavigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !container) return;
      if ((container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) return;

      // @ts-expect-error leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;

      const map = L.map(container).setView([41.5, 74.5], 6);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      addMarkers(L, map, stations, (id) => onNavigateRef.current?.(id));

      const withCoords = stations.filter((s) => s.latitude !== null && s.longitude !== null);
      if (withCoords.length > 0) {
        map.fitBounds(
          L.latLngBounds(withCoords.map((s) => [s.latitude!, s.longitude!])),
          { padding: [40, 40] },
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    import("leaflet").then((L) => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });
      addMarkers(L, map, stations, (id) => onNavigateRef.current?.(id));
    });
  }, [stations]);

  return (
    <div
      ref={containerRef}
      className="h-[400px] w-full overflow-hidden rounded-2xl border"
    />
  );
}
