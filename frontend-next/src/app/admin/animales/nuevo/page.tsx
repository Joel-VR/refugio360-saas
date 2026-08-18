"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authHeaders, friendlyErrorMessage, API_BASE_URL } from "@/lib/api";

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
        headers: { Accept: "application/json", ...authHeaders() },
        body: data,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Error ${res.status}`);
      }

      router.push("/admin/animales");
    } catch (err) {
      setError(friendlyErrorMessage(err, "No se pudo registrar el animal."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600 sm:text-sm">Nuevo registro</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-custom-900 sm:text-4xl">Crear animal</h1>
          </div>
          <Link
            href="/admin/animales"
            className="self-start rounded-full border border-slate-custom-50 px-4 py-2 text-sm text-slate-custom-700 transition hover:bg-slate-custom-50 sm:self-auto"
          >
            Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border border-slate-custom-50 bg-cream-50 p-4 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-custom-700">Nombre *</span>
              <input
                name="name"
                required
                className="w-full rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition placeholder:text-slate-custom-400 focus:border-brand-600"
                placeholder="Firulais"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-custom-700">Especie *</span>
              <select
                name="species"
                required
                className="w-full rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition focus:border-brand-600"
              >
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-custom-700">Edad estimada (meses)</span>
              <input
                name="estimated_age"
                type="number"
                min="0"
                className="w-full rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition placeholder:text-slate-custom-400 focus:border-brand-600"
                placeholder="12"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-custom-700">Estado *</span>
              <select
                name="lifecycle_status"
                required
                className="w-full rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition focus:border-brand-600"
              >
                <option value="cuarentena">Cuarentena</option>
                <option value="tratamiento">Tratamiento</option>
                <option value="apto">Apto para adopción</option>
                <option value="adoptado">Adoptado</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-slate-custom-700">Estado de salud</span>
            <textarea
              name="health_status"
              rows={4}
              className="w-full rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition placeholder:text-slate-custom-400 focus:border-brand-600"
              placeholder="Descripción general..."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-custom-700">Fotos (máx. 3)</span>
            <input
              name="photos"
              type="file"
              multiple
              accept="image/jpg,image/jpeg,image/png,image/webp"
              className="w-full rounded-2xl border border-dashed border-slate-custom-50 bg-cream-100 px-3 py-4 text-xs text-slate-custom-700 file:mr-3 file:rounded-full file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white sm:px-4 sm:py-5 sm:text-sm sm:file:mr-4 sm:file:px-4 sm:file:text-sm"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-rose-300/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/animales"
              className="rounded-full border border-slate-custom-50 px-5 py-3 text-center text-sm font-medium text-slate-custom-700 transition hover:bg-slate-custom-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Guardando…" : "Guardar animal"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}