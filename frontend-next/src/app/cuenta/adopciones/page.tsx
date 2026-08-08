"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { friendlyErrorMessage, getMyAdoptions } from "@/lib/api";
import type { Adoption } from "@/types/adoption";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "border-amber-300 bg-amber-50 text-amber-700" },
  evaluacion: { label: "En evaluación", className: "border-blue-300 bg-blue-50 text-blue-700" },
  aprobado: { label: "Aprobado", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  rechazado: { label: "Rechazado", className: "border-rose-300 bg-rose-50 text-rose-700" },
  adoptado: { label: "Adoptado", className: "border-violet-300 bg-violet-50 text-violet-700" },
};

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
      <h1 className="text-3xl font-semibold">Mis solicitudes de adopción</h1>

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
          <p className="text-sm text-slate-custom-700">Todavía no has solicitado ninguna adopción.</p>
          <Link href="/adoptar" className="mt-3 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Buscar animales para adoptar
          </Link>
        </div>
      )}

      {!loading && adoptions.length > 0 && (
        <div className="grid gap-3">
          {adoptions.map((adoption) => {
            const badge = STATUS_BADGE[adoption.status] ?? { label: adoption.status, className: "border-slate-300 bg-slate-100 text-slate-600" };
            const photo = adoption.animal?.photos?.[0];

            return (
              <article key={adoption.id} className="flex items-center gap-4 rounded-lg border border-slate-custom-50 bg-cream-50 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-2xl">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${STORAGE}/${photo.photo_path}`} alt={adoption.animal?.name ?? "Animal"} className="h-full w-full object-cover" />
                  ) : (
                    <span>🐾</span>
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
