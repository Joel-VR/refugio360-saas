"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const SHELTER_ID = 3; // el shelter que creamos

export default function NewAnimalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData();

    data.append("shelter_id", String(SHELTER_ID));
    data.append("name", (form.elements.namedItem("name") as HTMLInputElement).value);
    data.append("species", (form.elements.namedItem("species") as HTMLSelectElement).value);
    data.append("lifecycle_status", (form.elements.namedItem("lifecycle_status") as HTMLSelectElement).value);

    const age = (form.elements.namedItem("estimated_age") as HTMLInputElement).value;
    if (age) data.append("estimated_age", age);

    const health = (form.elements.namedItem("health_status") as HTMLTextAreaElement).value;
    if (health) data.append("health_status", health);

    const files = (form.elements.namedItem("photos") as HTMLInputElement).files;
    if (files) {
      Array.from(files).slice(0, 3).forEach((file) => data.append("photos[]", file));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/animals`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Error ${res.status}`);
      }

      router.push("/admin/animales");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Nuevo registro</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Crear animal</h1>
          </div>
          <Link href="/admin/animales" className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
            Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Nombre *</span>
              <input name="name" required className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400" placeholder="Firulais" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Especie *</span>
              <select name="species" required className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400">
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Edad estimada (meses)</span>
              <input name="estimated_age" type="number" min="0" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400" placeholder="12" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Estado *</span>
              <select name="lifecycle_status" required className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400">
                <option value="cuarentena">Cuarentena</option>
                <option value="tratamiento">Tratamiento</option>
                <option value="apto">Apto para adopción</option>
                <option value="adoptado">Adoptado</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Estado de salud</span>
            <textarea name="health_status" rows={4} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400" placeholder="Descripción general..." />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Fotos (máx. 3)</span>
            <input name="photos" type="file" multiple accept="image/jpg,image/jpeg,image/png,image/webp" className="rounded-2xl border border-dashed border-white/15 bg-slate-950/70 px-4 py-5 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950" />
          </label>

          {error && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href="/admin/animales" className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50">
              {loading ? "Guardando…" : "Guardar animal"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}