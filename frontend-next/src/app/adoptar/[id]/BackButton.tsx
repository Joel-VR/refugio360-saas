"use client";

import { useRouter } from "next/navigation";

function Icon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const BACK_ICON = "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18";

export default function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  function handleClick() {
    // Si hay historial real (venimos de /adoptar o de /refugios/[slug]/animales), volvemos ahí.
    // Si la persona llegó directo por URL (sin historial), caemos al catálogo general.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
    >
      <Icon path={BACK_ICON} />
      Volver a catalogo
    </button>
  );
}