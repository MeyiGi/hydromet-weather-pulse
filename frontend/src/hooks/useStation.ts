"use client";

import { api } from "@/lib/api";
import { Station } from "@/lib/types";
import { useEffect, useState, useRef } from "react";

interface Params {
  page: number;
  page_size: number;
  search: string;
  status: string;
}

export function useStations(params: Params) {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.stations(paramsRef.current);
        if (active) {
          setStations(data.results);
          setTotalPages(data.total_pages);
          setTotal(data.count);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.page_size, params.search, params.status]);

  return { stations, totalPages, total, error };
}
