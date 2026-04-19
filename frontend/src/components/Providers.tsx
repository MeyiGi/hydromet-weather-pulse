"use client";
import { ThemeProvider } from "next-themes";
import { LangProvider } from "@/lib/i18n";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}
