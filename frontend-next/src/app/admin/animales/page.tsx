import Link from "next/link";
import { getAnimals } from "@/lib/api";

const FILTERS = [
  { label: "Todos", value: "" },
  { label: "Apto adopción", value: "apto_adopcion" },
];

type AnimalsPageProps = {
  searchParams?: {
    status?: string;
  };
};

export default async function AnimalsPage({ searchParams }: AnimalsPageProps) {
  const activeStatus = searchParams?.status ?? "";
  const animals = await getAnimals(
    activeStatus ? { status: activeStatus } : {}
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] px-6 py-10 text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Admin
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                Animales registrados
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Vista base para listar animales, revisar su estado y preparar
                la conexión con la API de Laravel.
              </p>
            </div>
            <Link
              href="/admin/animales/nuevo"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Nuevo animal
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {FILTERS.map((filter) => {
              const isActive = filter.value === activeStatus;
              const href = filter.value
                ? `/admin/animales?status=${filter.value}`
                : "/admin/animales";

              return (
                <Link
                  key={filter.label}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {animals.map((animal) => (
            <article
              key={animal.id}
              className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg shadow-black/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {animal.species}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{animal.name}</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Refugio #{animal.shelter_id}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {animal.photos?.length ?? 0} fotos
                  </p>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  {animal.lifecycle_status}
                </span>
              </div>
            </article>
          ))}
        </div>

        {animals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-slate-300">
            No hay animales para el filtro seleccionado.
          </div>
        ) : null}
      </section>
    </main>
  );
}
