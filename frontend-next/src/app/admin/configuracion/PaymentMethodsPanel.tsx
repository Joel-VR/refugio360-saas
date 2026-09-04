"use client";

import { useState } from "react";
import Image from "next/image";
import { authHeaders, sanitizeErrorMessage, API_BASE_URL as API } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { compressImage } from "@/lib/imageCompression";
import type { Shelter } from "@/types/shelter";

export function PaymentMethodsPanel({ shelter: initialShelter }: { shelter: Shelter }) {
  const [current, setCurrent] = useState(initialShelter);
  const [form, setForm] = useState({
    yape_phone: initialShelter.yape_phone ?? "",
    yape_owner: initialShelter.yape_owner ?? "",
    plin_phone: initialShelter.plin_phone ?? "",
    plin_owner: initialShelter.plin_owner ?? "",
  });
  const [yapeQr, setYapeQr] = useState<File | null>(null);
  const [plinQr, setPlinQr] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    if (yapeQr) fd.append("yape_qr", yapeQr);
    if (plinQr) fd.append("plin_qr", plinQr);

    try {
      const res = await fetch(`${API}/admin/shelters/${initialShelter.id}/payment-methods`, {
        method: "POST",
        headers: { Accept: "application/json", ...authHeaders() },
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const firstError = body?.errors ? Object.values(body.errors).flat()[0] : body?.message;
        throw new Error(sanitizeErrorMessage(String(firstError ?? `Error ${res.status}`), "No se pudo guardar. Inténtalo de nuevo en unos minutos."));
      }
      setCurrent(body);
      setYapeQr(null);
      setPlinQr(null);
      setMessage("Métodos de pago actualizados.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteQr(method: "yape" | "plin") {
    setError("");
    setMessage("");
    const res = await fetch(`${API}/admin/shelters/${initialShelter.id}/payment-methods/${method}/qr`, {
      method: "DELETE",
      headers: { Accept: "application/json", ...authHeaders() },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(sanitizeErrorMessage(String(body?.message ?? "No se pudo eliminar el QR."), "No se pudo eliminar el QR. Inténtalo de nuevo en unos minutos."));
      return;
    }
    setCurrent(body);
    setMessage("QR eliminado.");
  }

  return (
    <form onSubmit={submit} className="grid gap-6 rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Métodos de Pago</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-custom-900">Yape y Plin del albergue</h2>
        <p className="mt-2 text-sm text-slate-custom-700">Configura al menos un método con número de 9 dígitos y titular.</p>
      </div>

      <PaymentSection
        title="Yape"
        phoneName="yape_phone"
        ownerName="yape_owner"
        phone={form.yape_phone}
        owner={form.yape_owner}
        qrPath={current.yape_qr_path}
        file={yapeQr}
        onChange={change}
        onFile={setYapeQr}
        onDelete={() => deleteQr("yape")}
      />

      <PaymentSection
        title="Plin"
        phoneName="plin_phone"
        ownerName="plin_owner"
        phone={form.plin_phone}
        owner={form.plin_owner}
        qrPath={current.plin_qr_path}
        file={plinQr}
        onChange={change}
        onFile={setPlinQr}
        onDelete={() => deleteQr("plin")}
      />

      {message && <p className="rounded-xl border border-emerald-300/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl border border-rose-300/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <button disabled={loading} className="w-fit rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar métodos de pago"}
      </button>
    </form>
  );
}

function PaymentSection({
  title, phoneName, ownerName, phone, owner, qrPath, file, onChange, onFile, onDelete,
}: {
  title: string;
  phoneName: string;
  ownerName: string;
  phone: string;
  owner: string;
  qrPath?: string | null;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFile: (file: File | null) => void;
  onDelete: () => void;
}) {
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <section className="grid gap-4 rounded-2xl border border-slate-custom-50 bg-slate-custom-50/50 p-5">
      <h3 className="text-lg font-semibold text-slate-custom-900">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-custom-700">
          Número celular
          <input
            name={phoneName}
            value={phone}
            onChange={onChange}
            maxLength={9}
            placeholder="987654321"
            className="rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-custom-700">
          Titular
          <input
            name={ownerName}
            value={owner}
            onChange={onChange}
            placeholder="Nombre de la cuenta"
            className="rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-3 text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {(preview || qrPath) && (
          <div className="relative h-28 w-28 rounded-xl border border-slate-custom-50 bg-cream-100 p-1">
            <Image
              src={preview ?? `${mediaUrl(qrPath)}`}
              alt={`QR ${title}`}
              fill
              sizes="112px"
              unoptimized={Boolean(preview)}
              className="object-contain"
            />
          </div>
        )}
        <label className="cursor-pointer rounded-full border border-slate-custom-50 px-4 py-2 text-sm font-medium text-slate-custom-700 hover:bg-slate-custom-50">
          Subir QR
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0] ?? null;
              onFile(file ? await compressImage(file) : null);
            }}
          />
        </label>
        {qrPath && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-rose-300/30 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"
          >
            Eliminar QR actual
          </button>
        )}
      </div>
    </section>
  );
}



