import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimal } from "@/lib/api";
import AdoptionForm from "./AdoptionForm";

const SPECIES_LABEL: Record<string, string> = {
  perro: "Perro",
  gato: "Gato",
  otro: "Otro",
};

const STATUS_INFO: Record<string, { label: string; color: string; description: string }> = {
  apto: {
    label: "Disponible para adopción",
    color: "text-emerald-300",
    description: "Este animal está listo para encontrar un hogar.",
  },
  cuarentena: {
    label: "En cuarentena",
    color: "text-amber-300",
    description: "Aún no está disponible para adopción.",
  },
  tratamiento: {
    label: "En tratamiento",
    color: "text-orange-300",
    description: "Está recibiendo atención veterinaria.",
  },
  adoptado: {
    label: "Adoptado",
    color: "text-slate-400",
    description: "Ya tiene un hogar. ¡Gracias!",
  },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AnimalDetailPage({ params }: Props) {
  const { id } = await params;
  let animal;

  try {
    animal = await getAnimal(id);
  } catch {
    notFound();
  }

  const status = STATUS_INFO[animal.lifecycle_status] ?? {
    label: animal.lifecycle_status,
    color: "text-slate-300",
    description: "",
  };

  const isAvailable = animal.lifecycle_status === "apto";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-5xl">
        {/* breadcrumb */}
        <Link
          href="/adoptar"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          ← Volver al catálogo
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* ── galería ── */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square overflow-hidden rounded-3xl border border-white/10 bg-slate-900 flex items-center justify-center text-8xl">
              {animal.photos && animal.photos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage"}/${animal.photos[0].photo_path}`}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {animal.species === "gato"
                    ? "🐱"
                    : animal.species === "perro"
                    ? "🐶"
                    : "🐾"}
                </span>
              )}
            </div>

            {/* fotos adicionales */}
            {animal.photos && animal.photos.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {animal.photos.slice(1).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-slate-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage"}/${photo.photo_path}`}
                      alt={animal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── info + formulario ── */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-400">
                {SPECIES_LABEL[animal.species] ?? animal.species}
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                {animal.name}
              </h1>

              <p className={`mt-3 text-sm font-medium ${status.color}`}>
                {status.label}
              </p>
              {status.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {status.description}
                </p>
              )}
            </div>

            {/* ficha */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Ficha del animal
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <dt className="text-slate-500">Especie</dt>
                <dd>{SPECIES_LABEL[animal.species] ?? animal.species}</dd>

                {animal.estimated_age != null && (
                  <>
                    <dt className="text-slate-500">Edad aproximada</dt>
                    <dd>{animal.estimated_age} meses</dd>
                  </>
                )}

                <dt className="text-slate-500">Esterilizado</dt>
                <dd>{animal.is_sterilized ? "Sí" : "No"}</dd>

                {animal.health_status && (
                  <>
                    <dt className="text-slate-500">Estado de salud</dt>
                    <dd className="col-span-1">{animal.health_status}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* formulario de adopción o mensaje */}
            {isAvailable ? (
              <AdoptionForm animalId={animal.id} shelterId={animal.shelter_id} />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
                {animal.lifecycle_status === "adoptado"
                  ? "Este animal ya fue adoptado. ¡Gracias por tu interés!"
                  : "Este animal aún no está disponible para adopción. Vuelve pronto."}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
