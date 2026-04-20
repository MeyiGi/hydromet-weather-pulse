export const countdown = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}h ${String(m).padStart(2, "0")}m`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const RT = {
  en: {
    never: "never",
    justNow: "just now",
    min: (n: number) => `${n}m ago`,
    hour: (n: number) => `${n}h ago`,
    day: (n: number) => `${n}d ago`,
  },
  ru: {
    never: "никогда",
    justNow: "только что",
    min: (n: number) => `${n} мин. назад`,
    hour: (n: number) => `${n} ч. назад`,
    day: (n: number) => `${n} д. назад`,
  },
  kg: {
    never: "эч качан",
    justNow: "азыр эле",
    min: (n: number) => `${n} мүн. мурун`,
    hour: (n: number) => `${n} саат мурун`,
    day: (n: number) => `${n} күн мурун`,
  },
} as const;

export const relativeTime = (iso: string | null, lang: "en" | "ru" | "kg" = "en") => {
  const L = RT[lang] ?? RT.en;
  if (!iso) return L.never;
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return L.justNow;
  if (s < 3600) return L.min(Math.floor(s / 60));
  if (s < 86400) return L.hour(Math.floor(s / 3600));
  return L.day(Math.floor(s / 86400));
};

export const utcHour = (h: number) => `${String(h).padStart(2, "0")}:00`;

export const localHour = (utcH: number): string => {
  const d = new Date();
  d.setUTCHours(utcH, 0, 0, 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
};
