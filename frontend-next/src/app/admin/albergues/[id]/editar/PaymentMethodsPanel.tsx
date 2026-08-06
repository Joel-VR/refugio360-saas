"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/adminAuth";
import type { Shelter } from "@/types/shelter";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

export default function PaymentMethodsPanel({ shelter }: { shelter: Shelter }) {
  const [current, setCurrent] = useState(shelter);
  const [form, setForm] = useState({
    yape_phone: shelter.yape_phone ?? "",
    yape_owner: shelter.yape_owner ?? "",
    plin_phone: shelter.plin_phone ?? "",
    plin_owner: shelter.plin_owner ?? "",
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
      const res = await adminFetch(`${API}/admin/shelters/${shelter.id}/payment-methods`, { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const firstError = body?.errors ? Object.values(body.errors).flat()[0] : body?.message;
        throw new Error(String(firstError ?? `Error ${res.status}`));
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
    const res = await adminFetch(`${API}/admin/shelters/${shelter.id}/payment-methods/${method}/qr`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body?.message ?? "No se pudo eliminar el QR.");
      return;
    }
    setCurrent(body);
    setMessage("QR eliminado.");
  }

  return (
    <form onSubmit={submit} className="grid gap-6 rounded-3xl border border-white/10 bg-cream-50/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Métodos de Pago</p>
        <h2 className="mt-2 text-2xl font-semibold">Yape y Plin del albergue</h2>
        <p className="mt-2 text-sm text-slate-400">Configura al menos un método con número de 9 dígitos y titular.</p>
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

      {message && <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{message}</p>}
      {error && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

      <button disabled={loading} className="w-fit rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-custom-900 transition hover:bg-cyan-300 disabled:opacity-50">
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
    <section className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          Número celular
          <input name={phoneName} value={phone} onChange={onChange} maxLength={9} placeholder="987654321" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400" />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          Titular
          <input name={ownerName} value={owner} onChange={onChange} placeholder="Nombre de la cuenta" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {(preview || qrPath) && (
          <img src={preview ?? `${STORAGE}/${qrPath}`} alt={`QR ${title}`} className="h-28 w-28 rounded-xl border border-white/10 bg-cream-50 object-contain p-1" />
        )}
        <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-cream-50/10">
          Subir QR
          <input type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
        {qrPath && <button type="button" onClick={onDelete} className="rounded-full border border-rose-400/30 px-4 py-2 text-sm text-rose-300 hover:bg-rose-400/10">Eliminar QR actual</button>}
      </div>
    </section>
  );
}
