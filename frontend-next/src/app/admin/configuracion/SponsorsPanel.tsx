"use client";

import { useState } from "react";
import Image from "next/image";
import { addShelterSponsor, deleteShelterSponsor } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Shelter } from "@/types/shelter";

export function SponsorsPanel({ shelter: initialShelter }: { shelter: Shelter }) {
  const [current, setCurrent] = useState(initialShelter);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sponsors = current.sponsors ?? [];
  const preview = logo ? URL.createObjectURL(logo) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!logo) {
      setError("Selecciona un logo.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const updated = await addShelterSponsor(initialShelter.id, { name, url: url || undefined, logo });
      setCurrent(updated);
      setName("");
      setUrl("");
      setLogo(null);
      setMessage("Insignia agregada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar la insignia.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(sponsorId: number) {
    setError("");
    setMessage("");
    try {
      const updated = await deleteShelterSponsor(initialShelter.id, sponsorId);
      setCurrent(updated);
      setMessage("Insignia eliminada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la insignia.");
    }
  }

  return (
    <div className="grid gap-6 rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Aliados</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-custom-900">Insignias de instituciones que apoyan al albergue</h2>
        <p className="mt-2 text-sm text-slate-custom-700">Se muestran como logos pequeños en el perfil público del albergue.</p>
      </div>

      {sponsors.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="group relative flex h-16 w-16 items-center justify-center rounded-xl border border-slate-custom-50 bg-white p-2"
              title={sponsor.name}
            >
              <Image src={mediaUrl(sponsor.logo_path)} alt={sponsor.name} fill sizes="64px" className="object-contain p-2" />
              <button
                type="button"
                onClick={() => remove(sponsor.id)}
                className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white group-hover:flex"
                aria-label={`Eliminar ${sponsor.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-slate-custom-50 bg-slate-custom-50/50 p-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-custom-700">
          Nombre de la institución
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Municipalidad de..."
            className="rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-custom-700">
          Enlace (opcional)
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          {preview && (
            <div className="relative h-16 w-16 rounded-xl border border-slate-custom-50 bg-white p-2">
              <Image src={preview} alt="Vista previa" fill sizes="64px" unoptimized className="object-contain p-2" />
            </div>
          )}
          <label className="cursor-pointer rounded-full border border-slate-custom-50 px-4 py-2 text-sm font-medium text-slate-custom-700 hover:bg-slate-custom-50">
            Subir logo
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
          </label>
          {logo && <span className="text-sm text-slate-custom-700">{logo.name}</span>}
        </div>

        {message && <p className="rounded-xl border border-emerald-300/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:col-span-2">{message}</p>}
        {error && <p className="rounded-xl border border-rose-300/30 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2">{error}</p>}

        <button
          disabled={loading}
          className="w-fit rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 sm:col-span-2"
        >
          {loading ? "Agregando..." : "Agregar insignia"}
        </button>
      </form>
    </div>
  );
}
