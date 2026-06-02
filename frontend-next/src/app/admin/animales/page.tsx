import Link from "next/link";

const animals = [
  {
    id: 1,
    name: "Firulais",
    species: "perro",
    status: "apto_adopcion",
    shelter: "Refugio Central",
  },
  {
    id: 2,
    name: "Michi",
    species: "gato",
    status: "tratamiento",
    shelter: "Refugio Central",
  },
];

export default function AnimalsPage() {
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
                  <p className="mt-2 text-sm text-slate-300">{animal.shelter}</p>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  {animal.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
