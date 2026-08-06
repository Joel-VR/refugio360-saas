"use client";

import { useState } from "react";
import { updateSuperAdminShelterStatus } from "@/lib/api";
import type { Shelter } from "@/types/shelter";

export function ShelterReviewList({
  initialShelters,
  emptyText,
  onStatusChange,
}: {
  initialShelters: Shelter[];
  emptyText: string;
  onStatusChange?: (shelter: Shelter) => void;
}) {
  const [shelters, setShelters] = useState(initialShelters);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function changeStatus(id: number, status: "approved" | "rejected") {
    setBusyId(id);
    setError("");

    try {
      const updated = await updateSuperAdminShelterStatus(id, status);
      setShelters((current) => current.map((shelter) => (shelter.id === id ? updated : shelter)));
      onStatusChange?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el albergue.");
    } finally {
      setBusyId(null);
    }
  }

  if (shelters.length === 0) {
    return <p className="rounded-lg border border-white/10 bg-cream-50/5 p-5 text-sm text-slate-300">{emptyText}</p>;
  }

  return (
    <div className="grid gap-4">
      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      {shelters.map((shelter) => {
        const responsible = shelter.users?.find((user) => user.role === "shelter_admin") ?? shelter.users?.[0];
        const pending = shelter.approval_status === "pending_review";

        return (
          <article key={shelter.id} className="rounded-lg border border-white/10 bg-cream-50/5 p-5 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{shelter.name}</h2>
                  <StatusBadge status={shelter.approval_status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{shelter.description || "Sin descripción registrada."}</p>
                <dl className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                  <Info label="Responsable" value={responsible?.name} />
                  <Info label="Correo" value={responsible?.email ?? shelter.email} />
                  <Info label="Teléfono" value={shelter.phone} />
                  <Info label="Dirección" value={shelter.address} />
                </dl>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={!pending || busyId === shelter.id}
                  onClick={() => changeStatus(shelter.id, "approved")}
                  className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-custom-900 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={!pending || busyId === shelter.id}
                  onClick={() => changeStatus(shelter.id, "rejected")}
                  className="rounded-md border border-rose-300/40 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-1 truncate text-slate-200">{value || "No registrado"}</dd>
    </div>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    approved: "border-emerald-300/40 bg-emerald-400/10 text-emerald-200",
    rejected: "border-rose-300/40 bg-rose-400/10 text-rose-200",
    pending_review: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status ?? ""] ?? "border-slate-500/40 bg-cream-1000/10 text-slate-200"}`}>
      {statusLabel(status)}
    </span>
  );
}

export function statusLabel(status?: string) {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  if (status === "pending_review") return "Pendiente";
  return "Sin estado";
}
