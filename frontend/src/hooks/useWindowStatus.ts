"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { WindowStatus } from "@/lib/types";

export function useWindowStatus() {
  const [status, setStatus] = useState<WindowStatus | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.window();
        if (active) setStatus(data);
      } catch {}
    };
    load();
    const id = setInterval(load, 10_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return { status };
}
