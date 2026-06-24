"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createShelter } from "@/lib/api";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewShelterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    email: "",
    phone: "",
    is_active: true,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => {
      const next = { ...prev, [name]: val };
      if (name === "name") next.slug = slugify(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createShelter({
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        is_active: form.is_active,
      });
      router.push("/admin/albergues");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Nuevo registro</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Crear albergue</h1>
          </div>
          <Link
            href="/admin/albergues"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Volver
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur"
        >
          {/* Nombre */}
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-300">
              Nombre <span className="text-rose-400">*</span>
            </span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Refugio Los Andes"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </label>

          {/* Slug */}
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-300">
              Slug <span className="text-rose-400">*</span>
              <span className="ml-2 text-xs text-slate-500">(solo letras, números y guiones)</span>
            </span>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              pattern="[a-z0-9\-]+"
              placeholder="refugio-los-andes"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
            <p className="text-xs text-slate-500">
              URL: /albergues/<span className="text-cyan-400">{form.slug || "..."}</span>
            </p>
          </label>

          {/* Descripción */}
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-300">Descripción</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Breve descripción del albergue..."
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 resize-none"
            />
          </label>

          {/* Email y Teléfono */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contacto@refugio.pe"
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Teléfono</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="987654321"
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />
            </label>
          </div>

          {/* Estado activo */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  form.is_active ? "bg-cyan-400" : "bg-slate-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.is_active ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
            <span className="text-sm text-slate-300">Albergue activo</span>
          </label>

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/albergues"
              className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? "Guardando…" : "Guardar albergue"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
