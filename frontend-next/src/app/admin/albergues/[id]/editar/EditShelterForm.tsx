"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateShelter } from "@/lib/api";
import type { Shelter } from "@/types/shelter";

export default function EditShelterForm({ shelter }: { shelter: Shelter }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: shelter.name,
    slug: shelter.slug,
    description: shelter.description ?? "",
    email: shelter.email ?? "",
    phone: shelter.phone ?? "",
    is_active: shelter.is_active,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateShelter(shelter.id, {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        is_active: form.is_active,
      });
      router.push("/admin/albergues");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur"
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm text-slate-300">Nombre <span className="text-rose-400">*</span></span>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-slate-300">Slug <span className="text-rose-400">*</span></span>
        <input
          name="slug"
          value={form.slug}
          onChange={handleChange}
          required
          pattern="[a-z0-9\-]+"
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-slate-300">Descripción</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 resize-none"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Teléfono</span>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="sr-only"
          />
          <div className={`w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-cyan-400" : "bg-slate-700"}`}>
            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
        </div>
        <span className="text-sm text-slate-300">Albergue activo</span>
      </label>

      {error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/albergues" className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
