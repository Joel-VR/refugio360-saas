"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { friendlyErrorMessage, getMyAdoptions } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Adoption } from "@/types/adoption";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "border-amber-300 bg-amber-50 text-amber-700" },
  evaluacion: { label: "En evaluaciÃ³n", className: "border-blue-300 bg-blue-50 text-blue-700" },
  aprobado: { label: "Aprobado", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  rechazado: { label: "Rechazado", className: "border-rose-300 bg-rose-50 text-rose-700" },
  adoptado: { label: "Adoptado", className: "border-violet-300 bg-violet-50 text-violet-700" },
};

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM21 21l-5.197-5.197" />
    </svg>
  );
}

function PawIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

export default function AccountAdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyAdoptions()
      .then(setAdoptions)
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudieron cargar tus solicitudes.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Mi solicitud de adopción</h1>
        <Link
          href="/adoptar"
          className="inline-flex w-fit items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <SearchIcon />
          Buscar animales para adoptar
        </Link>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading && (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-slate-custom-50 bg-cream-50" />
          ))}
        </div>
      )}

      {!loading && adoptions.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-custom-50 bg-cream-50 p-8 text-center">
          <p className="text-sm text-slate-custom-700">Todaví­a no has solicitado ninguna adopción.</p>
        </div>
      )}

      {!loading && adoptions.length > 0 && (
        <div className="grid gap-3">
          {adoptions.map((adoption) => {
            const badge = STATUS_BADGE[adoption.status] ?? { label: adoption.status, className: "border-slate-300 bg-slate-100 text-slate-600" };
            const photo = adoption.animal?.photos?.[0];

            return (
              <article key={adoption.id} className="flex items-center gap-4 rounded-lg border border-slate-custom-50 bg-cream-50 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-300">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${mediaUrl(photo.photo_path)}`} alt={adoption.animal?.name ?? "Animal"} className="h-full w-full object-cover" />
                  ) : (
                    <PawIcon className="h-7 w-7" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{adoption.animal?.name ?? `Animal #${adoption.animal_id}`}</p>
                  <p className="truncate text-sm text-slate-custom-700">
                    {adoption.created_at ? new Date(adoption.created_at).toLocaleDateString("es-PE") : ""}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}


