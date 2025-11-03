"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-7 bg-gray-200 rounded-full animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button onClick={() => setTheme(isDark ? "light" : "dark")} className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300" aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} type="button">
      <span className="sr-only">{isDark ? "Switch to light" : "Switch to dark"}</span>
      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isDark ? "left-7" : "left-0.5"}`}>{isDark ? "🌙" : "☀️"}</div>
    </button>
  );
}
