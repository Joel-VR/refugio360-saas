import Link from "next/link";
import { getAnimals } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Animal } from "@/types/animal";
import { PublicShell } from "@/lib/SimpleViews";

const SPECIES_LABEL: Record<string, string> = { perro: "Perro", gato: "Gato", otro: "Otro" };

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  apto: { label: "Disponible", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cuarentena: { label: "Cuarentena", className: "border-amber-200 bg-amber-50 text-amber-700" },
  tratamiento: { label: "En tratamiento", className: "border-orange-200 bg-orange-50 text-orange-700" },
  adoptado: { label: "Adoptado", className: "border-slate-200 bg-slate-100 text-slate-600" },
};

function PawIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function AnimalCard({ animal }: { animal: Animal }) {
  const badge = STATUS_BADGE[animal.lifecycle_status] ?? { label: animal.lifecycle_status, className: "border-slate-200 bg-slate-100 text-slate-600" };
  const isAvailable = animal.lifecycle_status === "apto";
  const photo = animal.photos?.[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-custom-50 bg-white transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 text-slate-300">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(photo.photo_path)}
            alt={animal.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-cream-50">
            <PawIcon />
          </div>
        )}
        <span className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{SPECIES_LABEL[animal.species] ?? animal.species}</p>
          <h2 className="mt-0.5 text-lg font-semibold text-slate-custom-900">{animal.name}</h2>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-custom-700">
          {animal.estimated_age != null && (
            <>
              <dt className="text-slate-500">Edad aprox.</dt>
              <dd>{animal.estimated_age} meses</dd>
            </>
          )}
          <dt className="text-slate-500">Esterilizado</dt>
          <dd>{animal.is_sterilized ? "Sí" : "No"}</dd>
        </dl>

        {animal.health_status && <p className="text-sm text-slate-custom-700 line-clamp-2">{animal.health_status}</p>}

        <div className="mt-auto pt-2">
          {isAvailable ? (
            <Link href={`/adoptar/${animal.id}`} className="block w-full rounded-full bg-brand-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700">
              Ver y postular
            </Link>
          ) : (
            <Link href={`/adoptar/${animal.id}`} className="block w-full rounded-full border border-slate-custom-50 py-2.5 text-center text-sm font-medium text-slate-custom-700 transition hover:border-brand-600/30">
              Ver ficha
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function AdoptarPage() {
  const animals = await getAnimals();
  const disponibles = animals.filter((a) => a.lifecycle_status === "apto");
  const otros = animals.filter((a) => a.lifecycle_status !== "apto");

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Refugio360</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-custom-900 sm:text-5xl">Encuentra a tu compañero</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-custom-700">
            Cada animal aquí espera un hogar. Revisa su ficha y envía tu postulación en minutos.
          </p>
        </div>

        {disponibles.length > 0 && (
          <>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-brand-600">
              Disponibles para adopción ({disponibles.length})
            </h2>
            <div className="mb-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {disponibles.map((a) => <AnimalCard key={a.id} animal={a} />)}
            </div>
          </>
        )}

        {otros.length > 0 && (
          <>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-slate-500">En proceso / ya adoptados</h2>
            <div className="grid gap-6 opacity-70 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {otros.map((a) => <AnimalCard key={a.id} animal={a} />)}
            </div>
          </>
        )}

        {animals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-custom-50 bg-cream-50 p-16 text-center">
            <PawIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-slate-custom-700">No hay animales registrados aún.</p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}


