"use client";

import { api } from "@/lib/api";
import { Station } from "@/lib/types";
import { useEffect, useState } from "react";

// returns list of stations and update every 15 secodns
export function useStations() {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.stations();
        if (active) {
          setStations(data);
          setError(null);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    };
    load();
    const id = setInterval(load, 15_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);
  return { stations, error };
}
