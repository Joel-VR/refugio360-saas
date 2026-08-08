"use client";

import { useTheme } from "@/lib/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">Tema:</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            theme === "light"
              ? "bg-brand-600 text-white"
              : "border border-slate-custom-50 bg-cream-50 text-slate-custom-700 hover:bg-slate-custom-50"
          }`}
        >
          ☀️ Claro
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            theme === "dark"
              ? "bg-brand-600 text-white"
              : "border border-slate-custom-50 bg-cream-50 text-slate-custom-700 hover:bg-slate-custom-50"
          }`}
        >
          🌙 Oscuro
        </button>
      </div>
    </div>
  );
}
