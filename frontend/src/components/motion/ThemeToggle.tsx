"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "night" ? "Switch to light theme" : "Switch to night theme"}
      title={theme === "night" ? "Switch to light theme" : "Switch to night theme"}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--chip-5)] text-[var(--fg-muted)] transition hover:bg-[var(--chip-8)] hover:text-[var(--fg-strong)] hover:shadow-md ${className}`}
    >
      {theme === "night" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}