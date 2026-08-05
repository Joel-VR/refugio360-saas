import Link from "next/link";
import { getAnimals } from "@/lib/api";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  apto: { label: "Apto adopción", className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
  cuarentena: { label: "Cuarentena", className: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
  tratamiento: { label: "Tratamiento", className: "bg-orange-400/10 text-orange-300 border-orange-400/30" },
  adoptado: { label: "Adoptado", className: "bg-slate-400/10 text-slate-400 border-slate-400/30" },
};

const FILTERS = [
  { label: "Todos", value: "" },
  { label: "Apto adopción", value: "apto_adopcion" },
];

type AnimalsPageProps = {
  searchParams?: Promise<{ status?: string }>;
};

export default async function AnimalsPage({ searchParams }: AnimalsPageProps) {
  const params = await searchParams;
  const activeStatus = params?.status ?? "";
  const animals = await getAnimals(activeStatus ? { status: activeStatus } : {});

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] px-6 py-10 text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-cream-50/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Admin</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">Animales registrados</h1>
            </div>
            <Link
              href="/admin/animales/nuevo"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-custom-900 transition hover:bg-cyan-300"
            >
              + Nuevo animal
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {FILTERS.map((filter) => {
              const isActive = filter.value === activeStatus;
              const href = filter.value ? `/admin/animales?status=${filter.value}` : "/admin/animales";
              return (
                <Link
                  key={filter.label}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-cyan-400 text-slate-custom-900"
                      : "border border-white/10 bg-cream-50/5 text-slate-200 hover:bg-cream-50/10"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((animal) => {
            const badge = STATUS_BADGE[animal.lifecycle_status] ?? {
              label: animal.lifecycle_status,
              className: "bg-slate-400/10 text-slate-400 border-slate-400/30",
            };
            const photo = animal.photos?.[0];

            return (
              <Link
                key={animal.id}
                href={`/admin/animales/${animal.id}`}   // ← este es el cambio
                className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-lg transition hover:border-white/20 hover:shadow-xl"
              >
                {/* foto */}
                <div className="relative h-48 bg-slate-custom-900 flex items-center justify-center text-5xl">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${STORAGE_URL}/${photo.photo_path}`}
                      alt={animal.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{animal.species === "gato" ? "🐱" : animal.species === "perro" ? "🐶" : "🐾"}</span>
                  )}
                  <span className={`absolute top-3 right-3 rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                {/* info */}
                <div className="flex flex-col gap-2 p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-400">{animal.species}</p>
                  <h2 className="text-xl font-semibold">{animal.name}</h2>
                  {animal.health_status && (
                    <p className="text-sm text-slate-400 line-clamp-2">{animal.health_status}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Refugio #{animal.shelter_id}</span>
                    <span>{animal.photos?.length ?? 0} foto{animal.photos?.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {animals.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/15 bg-cream-50/5 p-8 text-center text-slate-300">
            No hay animales para el filtro seleccionado.
          </div>
        )}
      </section>
    </main>
  );
}