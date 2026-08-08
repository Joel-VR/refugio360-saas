"use client";

import { useEffect, useRef, useState } from "react";
import { createLostFoundPost, friendlyErrorMessage } from "@/lib/api";
import type { LostFoundPostType } from "@/types/lostFoundPost";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function bytes(size: number) {
  return size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function LostFoundForm({ type, backHref }: { type: LostFoundPostType; backHref: string }) {
  const [form, setForm] = useState({ pet_name: "", species: "", zone: "", description: "", contact_phone: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function pickFile(nextFile: File) {
    if (!ALLOWED_TYPES.includes(nextFile.type)) {
      setPhotoError("Solo se aceptan JPG, PNG o WEBP.");
      return;
    }
    if (nextFile.size > MAX_SIZE) {
      setPhotoError(`El archivo supera 2MB (${bytes(nextFile.size)}).`);
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setPhotoError("");
  }

  function removePhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.zone.trim() || !form.description.trim() || !/^\d{9}$/.test(form.contact_phone)) {
      setError("Completa la zona, la descripción y un teléfono válido de 9 dígitos.");
      return;
    }

    setLoading(true);
    try {
      await createLostFoundPost({
        type,
        pet_name: form.pet_name.trim() || undefined,
        species: form.species || undefined,
        zone: form.zone.trim(),
        description: form.description.trim(),
        contact_phone: form.contact_phone,
        photo,
      });
      setSuccess(true);
    } catch (err) {
      setError(friendlyErrorMessage(err, "No se pudo publicar. Si el problema persiste, intenta sin foto."));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-3xl">🐾</p>
        <h2 className="mt-3 text-lg font-semibold text-emerald-800">¡Publicación enviada!</h2>
        <p className="mt-2 text-sm text-emerald-700">
          Un administrador la revisará antes de que aparezca públicamente. Puedes ver su estado en{" "}
          <a href={backHref} className="font-semibold underline">mis publicaciones</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-xl gap-3 rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
      <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
        Nombre de la mascota (opcional)
        <input name="pet_name" value={form.pet_name} onChange={handleChange} className="rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="Luna" />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
        Especie (opcional)
        <select name="species" value={form.species} onChange={handleChange} className="rounded-md border border-slate-300 px-3 py-2 font-normal">
          <option value="">Selecciona una especie</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otro</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
        Zona {type === "perdida" ? "donde se perdió" : "donde se encontró"} *
        <input required name="zone" value={form.zone} onChange={handleChange} className="rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="Ej. Amarilis, cerca al parque" />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
        Descripción *
        <textarea required name="description" value={form.description} onChange={handleChange} rows={4} className="rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="Color, tamaño, características..." />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
        Teléfono de contacto *
        <input required name="contact_phone" inputMode="numeric" maxLength={9} value={form.contact_phone} onChange={handleChange} className="rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="987654321" />
      </label>

      <div className="grid gap-1 text-sm font-medium text-slate-custom-700">
        Foto (opcional)
        {!photo ? (
          <div
            onDrop={(e) => {
              e.preventDefault();
              const next = e.dataTransfer.files[0];
              if (next) pickFile(next);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer rounded-md border-2 border-dashed border-slate-300 bg-cream-100 px-6 py-8 text-center text-sm font-normal text-slate-custom-700 transition hover:border-brand-600/50 hover:bg-cream-50"
          >
            <span className="block text-2xl">📷</span>
            <span className="mt-2 block">Arrastra una imagen aquí o haz clic para subir</span>
            <span className="mt-1 block text-xs text-slate-500">JPG, PNG o WEBP, máximo 2MB</span>
          </div>
        ) : (
          <div className="rounded-md border border-slate-custom-50 bg-white p-3">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vista previa" className="max-h-56 w-full rounded-md object-contain" />
            )}
            <div className="mt-3 flex items-center justify-between gap-3 text-sm font-normal">
              <span className="truncate text-slate-custom-700">{photo.name} · {bytes(photo.size)}</span>
              <button type="button" onClick={removePhoto} className="font-semibold text-rose-600 hover:underline">
                Quitar
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const next = e.target.files?.[0];
            if (next) pickFile(next);
          }}
        />
        {photoError && <p className="text-xs font-normal text-rose-600">{photoError}</p>}
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button disabled={loading} className="mt-2 w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
        {loading ? "Enviando..." : "Enviar a revisión"}
      </button>
    </form>
  );
}
