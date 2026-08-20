"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { friendlyErrorMessage, API_BASE_URL as API } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Animal } from "@/types/animal";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  apto: { label: "Disponible", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cuarentena: { label: "Cuarentena", className: "border-amber-200 bg-amber-50 text-amber-700" },
  tratamiento: { label: "En tratamiento", className: "border-orange-200 bg-orange-50 text-orange-700" },
  adoptado: { label: "Adoptado", className: "border-slate-200 bg-slate-100 text-slate-600" },
};

function Icon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  back: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18",
  paw: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  arrowRight: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
};

function BackButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/refugios/${slug}`}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
    >
      <Icon path={ICONS.back} className="h-4 w-4" />
      Volver al refugio
    </Link>
  );
}

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
    <SimplePage title="Animales del refugio" description="Puedes visualizar sus fichas. Para solicitar adopción se pedirá iniciar sesión.">
      <div className="-mt-4 flex flex-col gap-5">
        <BackButton slug={slug} />

        {/* Estado de Carga */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-custom-50 bg-white p-4 animate-pulse"
              >
                <div className="h-48 w-full rounded-xl bg-cream-100" />
                <div className="mt-4 space-y-2">
                  <div className="h-5 w-3/4 rounded-lg bg-cream-100" />
                  <div className="h-4 w-1/2 rounded-lg bg-cream-100" />
                </div>
                <div className="mt-5 flex gap-2">
                  <div className="h-9 flex-1 rounded-xl bg-cream-100" />
                  <div className="h-9 flex-1 rounded-xl bg-cream-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado de Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && animals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-custom-50 bg-cream-50/50 p-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-custom-400 shadow-sm">
              <Icon path={ICONS.paw} className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-custom-900">No hay animales publicados</p>
            <p className="mt-1 text-xs text-slate-custom-700">Este refugio todavía no tiene animales registrados o disponibles en este momento.</p>
          </div>
        )}

        {/* Grilla de animales */}
        {!loading && !error && animals.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {animals.map((animal) => {
              const badge = STATUS_BADGE[animal.lifecycle_status] ?? {
                label: animal.lifecycle_status,
                className: "border-slate-200 bg-slate-100 text-slate-600",
              };
              const photo = animal.photos?.[0];

              return (
                <article
                  key={animal.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-custom-50 bg-white transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5"
                >
                  <div>
                    {/* Imagen / Badge */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 text-slate-300">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${mediaUrl(photo.photo_path)}`}
                          alt={animal.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-cream-50 text-slate-custom-300">
                          <Icon path={ICONS.paw} className="h-10 w-10" />
                        </div>
                      )}
                      <span
                        className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                        {animal.species}
                      </p>
                      <h2 className="mt-0.5 text-lg font-semibold text-slate-custom-900 group-hover:text-brand-600 transition">
                        {animal.name}
                      </h2>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 p-4 pt-0">
                    <Link
                      href={`/refugios/${slug}/animales/${animal.id}`}
                      className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
                    >
                      Ver ficha
                    </Link>
                    {animal.lifecycle_status === "apto" ? (
                      <Link
                        href={`/adoptar/${animal.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                      >
                        Adoptar
                        <Icon path={ICONS.arrowRight} className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span
                        title="Este animal no está disponible para adopción en este momento."
                        className="flex-1 inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-400"
                      >
                        No disponible
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </SimplePage>
  );
}


