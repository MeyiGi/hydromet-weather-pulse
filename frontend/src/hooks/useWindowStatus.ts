"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import type { WindowStatus } from "@/lib/types";

export function useWindowStatus() {
  const [status, setStatus] = useState<WindowStatus | null>(null);
  const apiRef = useRef<{ data: WindowStatus; syncedAt: number } | null>(null);

  useEffect(() => {
    let active = true;

    const applyElapsed = () => {
      if (!apiRef.current) return;
      const { data, syncedAt } = apiRef.current;
      const elapsed = Math.max(0, Math.floor((Date.now() - syncedAt) / 1000));

      let updated: WindowStatus = data;
      if (data.is_open && data.current) {
        updated = {
          ...data,
          current: {
            ...data.current,
            seconds_left: Math.max(0, data.current.seconds_left - elapsed),
          },
        };
      } else if (!data.is_open && data.next) {
        updated = {
          ...data,
          next: {
            ...data.next,
            opens_in_seconds: Math.max(
              0,
              data.next.opens_in_seconds - elapsed,
            ),
          },
        };
      }
      setStatus(updated);
    };

    const load = async () => {
      try {
        const data = await api.window();
        if (!active) return;
        apiRef.current = { data, syncedAt: Date.now() };
        applyElapsed();
      } catch {}
    };

    load();
    const apiId = setInterval(load, 10_000);
    const tickId = setInterval(applyElapsed, 1_000);

    return () => {
      active = false;
      clearInterval(apiId);
      clearInterval(tickId);
    };
  }, []);

  return { status };
}
