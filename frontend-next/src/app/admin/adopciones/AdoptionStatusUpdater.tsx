"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdoptionStatus, deleteAdoption } from "@/lib/api";
import type { Adoption, AdoptionStatus } from "@/types/adoption";

const STATUS_OPTIONS: { value: AdoptionStatus; label: string }[] = [
  { value: "pendiente",  label: "Pendiente" },
  { value: "evaluacion", label: "En evaluación" },
  { value: "aprobado",   label: "Aprobado" },
  { value: "rechazado",  label: "Rechazado" },
  { value: "adoptado",   label: "Adoptado ✓" },
];

export default function AdoptionStatusUpdater({
  adoption,
}: {
  adoption: Adoption;
}) {
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
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      await deleteAdoption(adoption.id);
      router.refresh();
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as AdoptionStatus)}
        className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 transition"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Notas internas (opcional)..."
        className="resize-none rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-cyan-400 transition"
      />

      {error && (
        <p className="text-xs text-rose-300 border border-rose-400/30 bg-rose-400/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {success && (
        <p className="text-xs text-emerald-300 border border-emerald-400/30 bg-emerald-400/10 rounded-xl px-3 py-2">
          ✓ Estado actualizado
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="flex-1 rounded-full bg-cyan-400 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Actualizar estado"}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className={`rounded-full border px-3 py-2 text-xs transition disabled:opacity-50 ${
            confirmDelete
              ? "border-rose-400/50 bg-rose-400/10 text-rose-300"
              : "border-white/10 text-slate-500 hover:text-rose-300 hover:border-rose-400/30"
          }`}
        >
          {confirmDelete ? "¿Sí?" : "✕"}
        </button>
      </div>
    </div>
  );
}
