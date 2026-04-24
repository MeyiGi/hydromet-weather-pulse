"use client";

import { api } from "@/lib/api";
import { Station } from "@/lib/types";
import { useEffect, useState, useRef } from "react";

export function useStation(id: string) {
  const [station, setStation] = useState<Station | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const idRef = useRef(id);
  idRef.current = id;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    const load = async () => {
      try {
        const data = await api.station(idRef.current);
        if (active) {
          setStation(data);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          const msg = (e as Error).message;
          if (msg.includes("not found") || msg.includes("404")) {
            setNotFound(true);
          } else {
            setError(msg);
          }
          setLoading(false);
        }
      }
    };
    load();
    const interval = setInterval(load, 15_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);

  return { station, notFound, error, loading };
}

interface Params {
  page: number;
  page_size: number;
  search: string;
  status?: string;
}

export function useStations(params: Params) {
  const [stations, setStations] = useState<Station[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        const data = await api.stations(paramsRef.current);
        if (active) {
          setStations(data.results);
          setTotalPages(data.total_pages);
          setTotal(data.count);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (active) { setError((e as Error).message); setLoading(false); }
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

  return { stations, totalPages, total, error, loading };
}
