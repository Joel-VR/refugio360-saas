import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimal } from "@/lib/api";
import AdoptionForm from "./AdoptionForm";
import AnimalGallery from "./AnimalGallery";
import { PublicShell } from "@/lib/SimpleViews";
import type { Animal } from "@/types/animal";
import BackButton from "./BackButton";

const SPECIES_LABEL: Record<string, string> = { perro: "Perro", gato: "Gato", otro: "Otro" };

const STATUS_INFO: Record<string, { label: string; className: string; description: string }> = {
  apto: { label: "Disponible para adopción", className: "border-emerald-200 bg-emerald-50 text-emerald-700", description: "Este animal está listo para encontrar un hogar." },
  cuarentena: { label: "En cuarentena", className: "border-amber-200 bg-amber-50 text-amber-700", description: "Aún no está disponible para adopción." },
  tratamiento: { label: "En tratamiento", className: "border-orange-200 bg-orange-50 text-orange-700", description: "Está recibiendo atención veterinaria." },
  adoptado: { label: "Adoptado", className: "border-slate-200 bg-slate-100 text-slate-600", description: "Ya tiene un hogar. ¡Gracias!" },
};

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  back: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18",
  cake: "M12 6.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 6.75V9m-6 3.75h12M4.5 21v-6.375c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125V21M4.5 21h15M9 9.75c0-.98.79-1.808 1.5-2.598.71.79 1.5 1.618 1.5 2.598 0 .828-.672 1.5-1.5 1.5S9 10.578 9 9.75z",
  scissors: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055",
  heartPulse: "M20.25 8.511c0 4.5-8.25 10.239-8.25 10.239S3.75 13.011 3.75 8.511a4.739 4.739 0 019-2.03 4.739 4.739 0 019 2.03zM7.5 10.5h2.25l1.5-3 1.5 6 1.5-3h2.25",
  species: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
};



type Props = { params: Promise<{ id: string }> };

export default async function AnimalDetailPage({ params }: Props) {
  const { id } = await params;
  let animal: Animal;

  try {
    animal = await getAnimal(id);
  } catch {
    notFound();
  }

  const status = STATUS_INFO[animal.lifecycle_status] ?? { label: animal.lifecycle_status, className: "border-slate-200 bg-slate-100 text-slate-600", description: "" };
  const isAvailable = animal.lifecycle_status === "apto";

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6">
          <BackButton fallbackHref="/adoptar" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Galería */}
          <AnimalGallery photos={animal.photos ?? []} animalName={animal.name} />

          {/* Info + formulario */}
          <div className="flex flex-col gap-6">
            {/* Encabezado */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-custom-50 bg-white p-7">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-600/5" />
              <p className="relative text-sm font-semibold uppercase tracking-widest text-brand-600">
                {SPECIES_LABEL[animal.species] ?? animal.species}
              </p>
              <h1 className="relative mt-1 text-4xl font-semibold tracking-tight text-slate-custom-900">{animal.name}</h1>
              <span className={`relative mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              {status.description && <p className="relative mt-2 text-sm leading-6 text-slate-custom-700">{status.description}</p>}
            </div>

            {/* Ficha en tarjetas */}
            <div className="grid grid-cols-2 gap-3">
              <InfoStat icon={ICONS.species} label="Especie" value={SPECIES_LABEL[animal.species] ?? animal.species} />
              {animal.estimated_age != null && (
                <InfoStat icon={ICONS.cake} label="Edad aprox." value={`${animal.estimated_age} meses`} />
              )}
              <InfoStat icon={ICONS.scissors} label="Esterilizado" value={animal.is_sterilized ? "Sí" : "No"} />
              {animal.health_status && (
                <InfoStat icon={ICONS.heartPulse} label="Salud" value={animal.health_status} span={animal.estimated_age == null} />
              )}
            </div>

            {isAvailable ? (
              <AdoptionForm animalId={animal.id} shelterId={animal.shelter_id} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-custom-50 bg-cream-50 p-6 text-center text-sm text-slate-custom-700">
                {animal.lifecycle_status === "adoptado"
                  ? "Este animal ya fue adoptado. ¡Gracias por tu interés!"
                  : "Este animal aún no está disponible para adopción. Vuelve pronto."}
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function InfoStat({ icon, label, value, span }: { icon: string; label: string; value: string; span?: boolean }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border border-slate-custom-50 bg-white p-4 ${span ? "col-span-2" : ""}`}>
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600">
        <Icon path={icon} className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-custom-900">{value}</p>
      </div>
    </div>
  );
}