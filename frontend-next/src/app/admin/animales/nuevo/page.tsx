import Link from "next/link";

export default function NewAnimalPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
              Nuevo registro
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Crear animal
            </h1>
          </div>
          <Link
            href="/admin/animales"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Volver
          </Link>
        </div>

        <form className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Nombre</span>
              <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-400" placeholder="Firulais" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Especie</span>
              <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400" placeholder="perro" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Edad estimada</span>
              <input type="number" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400" placeholder="2" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Estado</span>
              <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400">
                <option>cuarentena</option>
                <option>tratamiento</option>
                <option>apto_adopcion</option>
                <option>adoptado</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Estado de salud</span>
            <textarea
              rows={4}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="Descripción general..."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Fotos</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="rounded-2xl border border-dashed border-white/15 bg-slate-950/70 px-4 py-5 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Guardar animal
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
