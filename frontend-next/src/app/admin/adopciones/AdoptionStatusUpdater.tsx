"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdoptionStatus, deleteAdoption } from "@/lib/api";
import type { Adoption, AdoptionStatus } from "@/types/adoption";
import { generateAdoptionPdf } from "@/lib/generateAdoptionPdf";

const STATUS_OPTIONS: { value: AdoptionStatus; label: string }[] = [
  { value: "pendiente",  label: "Pendiente" },
  { value: "evaluacion", label: "En evaluación" },
  { value: "aprobado",   label: "Aprobado" },
  { value: "rechazado",  label: "Rechazado" },
  { value: "adoptado",   label: "Adoptado ✓" },
];

export default function AdoptionStatusUpdater({ adoption }: { adoption: Adoption }) {
  const router = useRouter();
  const [status, setStatus] = useState<AdoptionStatus>(adoption.status);
  const [notes, setNotes] = useState(adoption.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await updateAdoptionStatus(adoption.id, status, notes || undefined);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); router.refresh(); }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoading(true);
    try {
      await deleteAdoption(adoption.id);
      router.refresh();
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  }

  function handleDownloadPdf() {
  generateAdoptionPdf({
    adoption: {
      id:             adoption.id,
      applicant_name: adoption.applicant_name,
      dni:            adoption.dni,
      phone:          adoption.phone,
      address:        adoption.address ?? '',
      created_at:     adoption.created_at ?? new Date().toISOString(),
    },
    animal: {
      name:          adoption.animal?.name ?? '',
      species:       adoption.animal?.species ?? '',
      estimated_age: adoption.animal?.estimated_age != null ? String(adoption.animal.estimated_age) : null,
      health_status: adoption.animal?.health_status ?? null,
    },
    shelter: {
      name:    adoption.shelter?.name ?? '',
      email:   adoption.shelter?.email ?? null,
      phone:   adoption.shelter?.phone ?? null,
      address: adoption.shelter?.address ?? null,
    },
  });
}

  return (
    <div className="flex flex-col gap-3 border-t border-slate-custom-50 pt-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as AdoptionStatus)}
        className="rounded-xl border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 outline-none focus:border-brand-600 transition"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Notas internas (opcional)..."
        className="resize-none rounded-xl border border-slate-custom-50 bg-cream-100 px-3 py-2 text-xs text-slate-custom-700 placeholder-slate-custom-400 outline-none focus:border-brand-600 transition"
      />

      {error && (
        <p className="text-xs text-rose-700 border border-rose-300/30 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-xs text-emerald-700 border border-emerald-300/30 bg-emerald-50 rounded-xl px-3 py-2">✓ Estado actualizado</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="flex-1 rounded-full bg-brand-600 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Actualizar estado"}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className={`rounded-full border px-3 py-2 text-xs transition disabled:opacity-50 ${
            confirmDelete
              ? "border-rose-400/50 bg-rose-50 text-rose-700"
              : "border-slate-custom-50 text-slate-custom-400 hover:text-rose-700 hover:border-rose-300/30"
          }`}
        >
          {confirmDelete ? "¿Sí?" : "✕"}
        </button>
      </div>

      {(status === "adoptado" || adoption.status === "adoptado") && (
        <button
          onClick={handleDownloadPdf}
          className="w-full rounded-full border border-brand-600 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-600 hover:text-white"
        >
          📄 Descargar acuerdo de adopción
        </button>
      )}
    </div>
  );
}