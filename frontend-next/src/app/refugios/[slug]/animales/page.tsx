"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { friendlyErrorMessage } from "@/lib/api";
import type { Animal } from "@/types/animal";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  apto: { label: "Disponible", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  cuarentena: { label: "Cuarentena", className: "border-amber-300 bg-amber-50 text-amber-700" },
  tratamiento: { label: "En tratamiento", className: "border-orange-300 bg-orange-50 text-orange-700" },
  adoptado: { label: "Adoptado", className: "border-slate-300 bg-slate-100 text-slate-600" },
};

const SPECIES_EMOJI: Record<string, string> = { perro: "🐶", gato: "🐱", otro: "🐾" };

export default function RefugioAnimalsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/public/shelters/${slug}/animals`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar los animales de este refugio.");
        return r.json();
      })
      .then((data) => setAnimals(Array.isArray(data) ? data : []))
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudieron cargar los animales de este refugio.")))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <SimplePage title="Animales del refugio" description="Puedes visualizar fichas. Para solicitar adopción se pedirá iniciar sesión.">
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg border border-slate-custom-50 bg-cream-50" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
      )}

      {!loading && !error && animals.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-custom-50 bg-cream-50 p-8 text-center text-sm text-slate-custom-700">
          Este refugio todavía no tiene animales publicados.
        </div>
      )}

      {!loading && !error && animals.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {animals.map((animal) => {
            const badge = STATUS_BADGE[animal.lifecycle_status] ?? {
              label: animal.lifecycle_status,
              className: "border-slate-300 bg-slate-100 text-slate-600",
            };
            const photo = animal.photos?.[0];

            return (
              <article key={animal.id} className="flex flex-col overflow-hidden rounded-lg border border-slate-custom-50 bg-cream-50 shadow-sm">
                <div className="relative flex h-40 items-center justify-center bg-slate-100 text-5xl">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${STORAGE}/${photo.photo_path}`} alt={animal.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{SPECIES_EMOJI[animal.species] ?? "🐾"}</span>
                  )}
                  <span className={`absolute right-2 top-2 rounded-full border px-2 py-1 text-xs font-semibold ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="text-lg font-semibold">{animal.name}</h2>
                    <p className="text-sm capitalize text-slate-custom-700">{animal.species}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link href={`/refugios/${slug}/animales/${animal.id}`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">
                      Ver ficha
                    </Link>
                    <Link href={`/login?next=/adoptar/${animal.id}`} className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
                      Solicitar adopción
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </SimplePage>
  );
}
