"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Ícono de interrogante junto a un título: al hacer clic abre un popover
 * pequeño con la ayuda/descripción; un segundo clic (o clic afuera / Escape)
 * lo oculta. Reutilizable en cualquier encabezado de página o sección.
 *
 * El popover se monta en document.body (portal) y se posiciona `fixed` con
 * las coordenadas del botón, para escapar de cualquier contexto de
 * apilamiento local (tarjetas, mapas, headers) y quedar siempre por encima.
 */
export function HelpToggle({ children, label = "Ayuda" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScrollOrResize() {
      setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  function toggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={toggle}
        className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
          open
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-slate-custom-50 bg-white text-slate-custom-500 hover:border-brand-600/40 hover:text-brand-600"
        }`}
      >
        ?
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-[9999] w-64 rounded-xl border border-slate-custom-50 bg-white p-3 text-xs leading-5 text-slate-custom-700 shadow-xl"
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}
