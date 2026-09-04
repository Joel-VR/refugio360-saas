"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ícono de interrogante junto a un título: al hacer clic abre un popover
 * pequeño con la ayuda/descripción; un segundo clic (o clic afuera / Escape)
 * lo oculta. Reutilizable en cualquier encabezado de página o sección.
 */
export function HelpToggle({ children, label = "Ayuda" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
          open
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-slate-custom-50 bg-white text-slate-custom-500 hover:border-brand-600/40 hover:text-brand-600"
        }`}
      >
        ?
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 top-8 z-50 w-72 rounded-2xl border border-slate-custom-50 bg-white p-4 text-sm leading-6 text-slate-custom-700 shadow-xl"
        >
          {children}
        </div>
      )}
    </div>
  );
}
