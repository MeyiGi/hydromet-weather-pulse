import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { WindowStatus } from "@/lib/types";

export function useWindowStatus() {
  const [status, setStatus] = useState<WindowStatus | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.window();
        setStatus(data);
      } catch {
        // keep last known status
      }
    };
    load();
    const interval = setInterval(load, 5_000);
    return () => clearInterval(interval);
  }, []);

  // local countdown tick
  useEffect(() => {
    if (!status) return;
    const tick = setInterval(() => {
      setStatus((prev) => {
        if (!prev) return prev;
        if (prev.is_open && prev.current) {
          const next = prev.current.seconds_left - 1;
          if (next <= 0) return prev; // let poll refresh
          return { ...prev, current: { ...prev.current, seconds_left: next } };
        }
        if (!prev.is_open && prev.next) {
          const next = prev.next.opens_in_seconds - 1;
          if (next <= 0) return prev;
          return { ...prev, next: { ...prev.next, opens_in_seconds: next } };
        }
        return prev;
      });
    }, 1_000);
    return () => clearInterval(tick);
  }, [status?.is_open]);

  return { status };
}
