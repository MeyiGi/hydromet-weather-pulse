import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Station } from "@/lib/types";

export function useStations() {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.stations({ page_size: 100 });
      setStations(data.results);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [load]);

  return { stations, error, refreshing, onRefresh };
}
