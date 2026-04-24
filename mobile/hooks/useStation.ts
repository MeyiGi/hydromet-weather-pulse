import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { Station } from "@/lib/types";

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
    setError(null);

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
