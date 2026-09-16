"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "night" | "light";

const THEME_KEY = "skilltrace-theme";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}>({
  theme: "night",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("night");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    setThemeState(stored === "light" ? "light" : "night");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((p) => (p === "night" ? "light" : "night")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}