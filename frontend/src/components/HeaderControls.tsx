"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, type Lang } from "@/lib/i18n";
import { NotificationsBell } from "@/components/NotificationBell";

const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
  { value: "kg", label: "КГ" },
];

export function HeaderControls() {
  const { resolvedTheme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-0.5">
      <div className="flex items-center mr-1">
        {LANGS.map(({ value, label }) => (
          <Button
            key={value}
            variant={lang === value ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs rounded-lg font-medium"
            onClick={() => setLang(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        disabled={!mounted}
        aria-label="Toggle theme"
      >
        {mounted && resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      <NotificationsBell />
    </div>
  );
}
