import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { Station } from "@/lib/types";

interface Params {
  page: number;
  page_size: number;
  search: string;
  status?: string;
}

export function useStations(params: Params = { page: 1, page_size: 20, search: "" }) {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const load = useCallback(async () => {
    try {
      const data = await api.stations(paramsRef.current);
      setStations(data.results);
      setTotalPages(data.total_pages);
      setTotal(data.count);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.page_size, params.search, params.status]);

  return { stations, totalPages, total, error, loading, refreshing, onRefresh };
}
