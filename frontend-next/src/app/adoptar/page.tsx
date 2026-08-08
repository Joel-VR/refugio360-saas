import Link from "next/link";
import { getAnimals } from "@/lib/api";
import type { Animal } from "@/types/animal";
import { PublicShell } from "@/lib/SimpleViews";

const SPECIES_LABEL: Record<string, string> = {
  perro: "🐶 Perro",
  gato: "🐱 Gato",
  otro: "🐾 Otro",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  apto: {
    label: "Disponible",
    className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  },
  cuarentena: {
    label: "Cuarentena",
    className: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  },
  tratamiento: {
    label: "En tratamiento",
    className: "bg-orange-400/10 text-orange-300 border-orange-400/30",
  },
  adoptado: {
    label: "Adoptado",
    className: "bg-slate-400/10 text-slate-400 border-slate-400/30",
  },
};

function AnimalCard({ animal }: { animal: Animal }) {
  const badge = STATUS_BADGE[animal.lifecycle_status] ?? {
    label: animal.lifecycle_status,
    className: "bg-slate-400/10 text-slate-400 border-slate-400/30",
  };
  const isAvailable = animal.lifecycle_status === "apto";

  return (
    <article className="group flex flex-col rounded-3xl border border-slate-custom-50 bg-cream-50 shadow-sm overflow-hidden transition hover:border-brand-600 hover:shadow-md">
      {/* foto placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-cream-100 flex items-center justify-center text-5xl">
        {animal.photos && animal.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage"}/${animal.photos[0].photo_path}`}
            alt={animal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{animal.species === "gato" ? "🐱" : animal.species === "perro" ? "🐶" : "🐾"}</span>
        )}
        <span
          className={`absolute top-3 right-3 rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-custom-700">
            {SPECIES_LABEL[animal.species] ?? animal.species}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-custom-900">
            {animal.name}
          </h2>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-custom-700">
          {animal.estimated_age != null && (
            <>
              <dt className="text-slate-custom-600">Edad aprox.</dt>
              <dd>{animal.estimated_age} meses</dd>
            </>
          )}
          <dt className="text-slate-custom-600">Esterilizado</dt>
          <dd>{animal.is_sterilized ? "Sí" : "No"}</dd>
        </dl>

        {animal.health_status && (
          <p className="text-sm text-slate-custom-700 line-clamp-2">
            {animal.health_status}
          </p>
        )}

        <div className="mt-auto pt-4">
          {isAvailable ? (
            <Link
              href={`/adoptar/${animal.id}`}
              className="block w-full rounded-full bg-brand-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Ver y postular
            </Link>
          ) : (
            <Link
              href={`/adoptar/${animal.id}`}
              className="block w-full rounded-full border border-slate-custom-50 py-2.5 text-center text-sm font-medium text-slate-custom-700 transition hover:border-slate-custom-100 hover:bg-slate-custom-50"
            >
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
        {/* encabezado */}
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-600">
            Refugio360
          </p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-custom-900">
            Encuentra a tu compañero
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-custom-700">
            Cada animal aquí espera un hogar. Revisa su ficha y envía tu
            postulación en minutos.
          </p>
        </div>

        {/* disponibles para adoptar */}
        {disponibles.length > 0 && (
          <>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-brand-600">
              Disponibles para adopción ({disponibles.length})
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-14">
              {disponibles.map((a) => (
                <AnimalCard key={a.id} animal={a} />
              ))}
            </div>
          </>
        )}

        {/* otros */}
        {otros.length > 0 && (
          <>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-slate-custom-600">
              En proceso / ya adoptados
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-60">
              {otros.map((a) => (
                <AnimalCard key={a.id} animal={a} />
              ))}
            </div>
          </>
        )}

        {animals.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-custom-50 bg-cream-50 p-16 text-center">
            <p className="text-2xl">🐾</p>
            <p className="mt-4 text-slate-custom-700">
              No hay animales registrados aún.
            </p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}