"use client";

import { useState } from "react";
import Image from "next/image";
import { updateShelterProfile, updateShelterLogo } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { compressImage } from "@/lib/imageCompression";
import type { Shelter } from "@/types/shelter";

export function ShelterProfileForm({ shelter: initialShelter }: { shelter: Shelter }) {
  const [shelter, setShelter] = useState(initialShelter);
  const [form, setForm] = useState({
    name: initialShelter.name ?? "",
    description: initialShelter.description ?? "",
    email: initialShelter.email ?? "",
    phone: initialShelter.phone ?? "",
    address: initialShelter.address ?? "",
    facebook_url: initialShelter.facebook_url ?? "",
    instagram_url: initialShelter.instagram_url ?? "",
    tiktok_url: initialShelter.tiktok_url ?? "",
    whatsapp_url: initialShelter.whatsapp_url ?? "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setLogoFile(compressed);
      setLogoPreview(URL.createObjectURL(compressed));
    }
  }

  async function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateShelterProfile(shelter.id, {
        ...form,
        facebook_url: form.facebook_url || null,
        instagram_url: form.instagram_url || null,
        tiktok_url: form.tiktok_url || null,
        whatsapp_url: form.whatsapp_url || null,
      });
      setShelter(updated);
      setMessage("Perfil del albergue actualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }

  async function submitLogo() {
    if (!logoFile) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateShelterLogo(shelter.id, logoFile);
      setShelter(updated);
      setLogoFile(null);
      setLogoPreview(null);
      setMessage("Logo del albergue actualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el logo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Logo section */}
      <div className="flex h-full flex-col rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Logo del Albergue</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-custom-900">Imagen representativa</h3>
        </div>

        <div className="flex flex-row flex-nowrap items-start gap-6">
          <div className="flex flex-col gap-3">
            {logoPreview || shelter.logo_path ? (
              <div className="relative h-32 w-32 rounded-xl border border-slate-custom-50 bg-cream-100 p-2">
                <Image
                  src={logoPreview ?? `${mediaUrl(shelter.logo_path)}`}
                  alt="Logo del albergue"
                  fill
                  sizes="128px"
                  unoptimized={Boolean(logoPreview)}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-32 w-32 rounded-xl border-2 border-dashed border-slate-custom-50 bg-slate-custom-50/30 flex items-center justify-center text-4xl">
                ðŸ 
              </div>
            )}
            <label className="cursor-pointer rounded-full border border-slate-custom-50 px-4 py-2 text-center text-sm font-medium text-slate-custom-700 hover:bg-slate-custom-50">
              Cambiar logo
              <input type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>

          {logoFile && (
            <div className="flex flex-col gap-3 flex-1">
              <p className="text-sm text-slate-custom-700">
                Archivo seleccionado: <strong>{logoFile.name}</strong>
              </p>
              <button
                type="button"
                onClick={submitLogo}
                disabled={loading}
                className="rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar logo"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={submitProfile} className="rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Información del Albergue</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-custom-900">Datos principales</h3>
        </div>

        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-custom-900 mb-2">Nombre del albergue</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-custom-900 mb-2">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-custom-900 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-custom-900 mb-2">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-custom-900 mb-2">Dirección</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-custom-900">Redes sociales</p>
            <p className="mb-3 text-xs text-slate-custom-700">Opcional. Deja en blanco las que no tengas.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-custom-700 mb-1">Facebook</label>
                <input
                  type="url"
                  name="facebook_url"
                  value={form.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/tu-albergue"
                  className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-custom-700 mb-1">Instagram</label>
                <input
                  type="url"
                  name="instagram_url"
                  value={form.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/tu-albergue"
                  className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-custom-700 mb-1">TikTok</label>
                <input
                  type="url"
                  name="tiktok_url"
                  value={form.tiktok_url}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@tu-albergue"
                  className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-custom-700 mb-1">WhatsApp</label>
                <input
                  type="url"
                  name="whatsapp_url"
                  value={form.whatsapp_url}
                  onChange={handleChange}
                  placeholder="https://wa.me/51987654321"
                  className="w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>
            </div>
          </div>
        </div>

        {message && <p className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-xl border border-rose-300/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <button
          disabled={loading}
          className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </>
  );
}



