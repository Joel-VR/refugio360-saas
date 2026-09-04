"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SimplePage } from "@/lib/SimpleViews";
import { friendlyErrorMessage, API_BASE_URL as API } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Animal } from "@/types/animal";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  apto: { label: "Disponible para adopción", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cuarentena: { label: "En cuarentena", className: "border-amber-200 bg-amber-50 text-amber-700" },
  tratamiento: { label: "En tratamiento médico", className: "border-orange-200 bg-orange-50 text-orange-700" },
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
  heart: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  heartPulse: "M20.25 8.511c0 4.5-8.25 10.239-8.25 10.239S3.75 13.011 3.75 8.511a4.739 4.739 0 019-2.03 4.739 4.739 0 019 2.03zM7.5 10.5h2.25l1.5-3 1.5 6 1.5-3h2.25",
  arrowRight: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
  eye: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M12 15a3 3 0 100-6 3 3 0 000 6z",
  close: "M6 18L18 6M6 6l12 12",
  chevronLeft: "M15.75 19.5L8.25 12l7.5-7.5",
  chevronRight: "M8.25 4.5l7.5 7.5-7.5 7.5",
};

export default function RefugioAnimalDetailPage() {
  const { slug, animalId } = useParams<{ slug: string; animalId: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPhoto, setShowPhoto] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    fetch(`${API}/animals/${animalId}`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar la ficha de este animal.");
        return r.json();
      })
      .then(setAnimal)
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudo cargar la ficha de este animal.")))
      .finally(() => setLoading(false));
  }, [animalId]);

  if (loading) {
    return (
      <SimplePage title="Cargando ficha..." description="Obteniendo la información del animal">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-8 w-36 animate-pulse rounded-full bg-cream-100" />
          <div className="h-96 w-full animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
        </div>
      </SimplePage>
    );
  }

  if (error || !animal) {
    return (
      <SimplePage title="Ficha del animal" description="Información pública del animal.">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            href={`/refugios/${slug}/animales`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
          >
            <Icon path={ICONS.back} className="h-4 w-4" />
            Volver al listado
          </Link>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            {error || "No encontramos este animal."}
          </div>
        </div>
      </SimplePage>
    );
  }

  const photos = animal.photos ?? [];
  const photo = photos[0];
  const activePhoto = photos[photoIndex];
  const badge = STATUS_BADGE[animal.lifecycle_status] ?? {
    label: animal.lifecycle_status,
    className: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <SimplePage title={`Ficha de ${animal.name}`} description="Información detallada para el proceso de adopción.">
      <div className="-mt-4 mx-auto max-w-4xl space-y-5">
        {/* Botón Volver */}
        <Link
          href={`/refugios/${slug}/animales`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
        >
          <Icon path={ICONS.back} className="h-4 w-4" />
          Volver a animales
        </Link>

        {/* Tarjeta Principal */}
        <div className="overflow-hidden rounded-2xl border border-slate-custom-50 bg-white shadow-sm transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Foto del Animal */}
            <div className="relative md:col-span-5 bg-slate-100 min-h-[260px] md:min-h-[380px]">
              {photo ? (
                <Image
                  src={`${mediaUrl(photo.photo_path)}`}
                  alt={animal.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-cream-50 text-slate-custom-300">
                  <Icon path={ICONS.paw} className="h-16 w-16" />
                </div>
              )}
              <span
                className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${badge.className}`}
              >
                {badge.label}
              </span>
              {photo && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoIndex(0);
                    setShowPhoto(true);
                  }}
                  aria-label="Ver imagen completa"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
                >
                  <Icon path={ICONS.eye} className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Detalles del Animal */}
            <div className="flex flex-col justify-between p-6 md:col-span-7 sm:p-8">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                    {animal.species}
                  </span>
                  <h1 className="mt-1 text-2xl font-bold text-slate-custom-900 sm:text-3xl">
                    {animal.name}
                  </h1>
                </div>

                {/* Grid de Datos Clave */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-cream-50/50 p-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                      <Icon path={ICONS.paw} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-custom-700">Especie</p>
                      <p className="text-xs font-semibold capitalize text-slate-custom-900">{animal.species}</p>
                    </div>
                  </div>

                  {animal.estimated_age != null && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-cream-50/50 p-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                        <Icon path={ICONS.calendar} className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-custom-700">Edad estimada</p>
                        <p className="text-xs font-semibold text-slate-custom-900">{animal.estimated_age} meses</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-cream-50/50 p-3 sm:col-span-2">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                      <Icon path={ICONS.heartPulse} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-custom-700">Estado de salud</p>
                      <p className="text-xs font-semibold text-slate-custom-900">
                        {animal.health_status || "Sin observaciones de salud registradas."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Acción Principal */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/login?next=/adoptar/${animalId}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  <Icon path={ICONS.heart} className="h-4 w-4" />
                  Solicitar adopción
                  <Icon path={ICONS.arrowRight} className="h-4 w-4 ml-auto sm:ml-0" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showPhoto && activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setShowPhoto(false)}
        >
          <div
            className="relative flex max-h-[70vh] w-full max-w-2xl items-center justify-center rounded-2xl bg-black/90 p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPhoto(false)}
              aria-label="Cerrar"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Icon path={ICONS.close} className="h-5 w-5" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl(activePhoto.photo_path)}
              alt={animal.name}
              className="max-h-[64vh] max-w-full rounded-lg object-contain"
            />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Icon path={ICONS.chevronLeft} className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Icon path={ICONS.chevronRight} className="h-5 w-5" />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
                  {photoIndex + 1} / {photos.length}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </SimplePage>
  );
}


