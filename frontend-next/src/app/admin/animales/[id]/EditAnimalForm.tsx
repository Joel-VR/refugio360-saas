// src/app/admin/animales/[id]/EditAnimalForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authHeaders, friendlyErrorMessage, API_BASE_URL } from "@/lib/api";

type Animal = {
  id: number;
  shelter_id: number;
  name: string;
  species: string;
  estimated_age: number | null;
  lifecycle_status: string;
  health_status: string | null;
  photos: { photo_path: string }[] | null;
};

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

export default function EditAnimalForm({ animal }: { animal: Animal }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado local para controlar la vista previa de las fotos actuales
  const [currentPhotos] = useState(animal.photos || []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData();

    // Agregamos los campos del formulario (se envían todos, incluso si no cambiaron)
    data.append("name", (form.elements.namedItem("name") as HTMLInputElement).value);
    data.append("species", (form.elements.namedItem("species") as HTMLSelectElement).value);
    data.append("lifecycle_status", (form.elements.namedItem("lifecycle_status") as HTMLSelectElement).value);

    const age = (form.elements.namedItem("estimated_age") as HTMLInputElement).value;
    if (age) data.append("estimated_age", age);

    const health = (form.elements.namedItem("health_status") as HTMLTextAreaElement).value;
    if (health) data.append("health_status", health);

    // Fotografías: si se seleccionan nuevas, se envían y la API debería reemplazar todas las anteriores
    const files = (form.elements.namedItem("photos") as HTMLInputElement).files;
    if (files && files.length > 0) {
      Array.from(files).slice(0, 3).forEach((file) => data.append("photos[]", file));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/animals/${animal.id}`, {
        method: "PUT", // o "PATCH" según tu API
        headers: { Accept: "application/json", ...authHeaders() },
        body: data,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Error ${res.status}`);
      }

      router.push("/admin/animales");
      router.refresh(); // para actualizar el listado
    } catch (err) {
      setError(friendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-slate-custom-700">Nombre *</span>
          <input
            name="name"
            required
            defaultValue={animal.name}
            className="rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition placeholder:text-slate-custom-400 focus:border-brand-600"
            placeholder="Firulais"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-custom-700">Especie *</span>
          <select
            name="species"
            required
            defaultValue={animal.species}
            className="rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition focus:border-brand-600"
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
            defaultValue={animal.estimated_age ?? ""}
            className="rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition placeholder:text-slate-custom-400 focus:border-brand-600"
            placeholder="12"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-custom-700">Estado *</span>
          <select
            name="lifecycle_status"
            required
            defaultValue={animal.lifecycle_status}
            className="rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition focus:border-brand-600"
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
          defaultValue={animal.health_status ?? ""}
          className="rounded-2xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none transition placeholder:text-slate-custom-400 focus:border-brand-600"
          placeholder="Descripción general..."
        />
      </label>

      {/* Visualización de fotos actuales */}
      {currentPhotos.length > 0 && (
        <div className="grid gap-2">
          <span className="text-sm text-slate-custom-700">Fotos actuales</span>
          <div className="flex flex-wrap gap-3">
            {currentPhotos.map((photo, idx) => (
              <img
                key={idx}
                src={`${STORAGE_URL}/${photo.photo_path}`}
                alt={`Foto ${idx + 1}`}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <label className="grid gap-2">
        <span className="text-sm text-slate-custom-700">
          {currentPhotos.length > 0 ? "Reemplazar fotos (máx. 3)" : "Subir fotos (máx. 3)"}
        </span>
        <input
          name="photos"
          type="file"
          multiple
          accept="image/jpg,image/jpeg,image/png,image/webp"
          className="rounded-2xl border border-dashed border-slate-custom-50 bg-cream-100 px-4 py-5 text-sm text-slate-custom-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:font-semibold file:text-white"
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
          {loading ? "Guardando…" : "Actualizar animal"}
        </button>
      </div>
    </form>
  );
}