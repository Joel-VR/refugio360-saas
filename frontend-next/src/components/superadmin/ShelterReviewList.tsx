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
    return (
      <p className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 text-sm text-slate-custom-700">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {shelters.map((shelter) => {
        const responsible = shelter.users?.find((user) => user.role === "shelter_admin") ?? shelter.users?.[0];
        const pending = shelter.approval_status === "pending_review";

        return (
          <article key={shelter.id} className="rounded-lg border border-slate-custom-50 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-custom-900">{shelter.name}</h2>
                  <StatusBadge status={shelter.approval_status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-custom-700">{shelter.description || "Sin descripción registrada."}</p>
                <dl className="mt-4 grid gap-2 text-sm text-slate-custom-700 sm:grid-cols-2">
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
                  className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={!pending || busyId === shelter.id}
                  onClick={() => changeStatus(shelter.id, "rejected")}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
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
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{label}</dt>
      <dd className="mt-1 truncate text-slate-custom-700">{value || "No registrado"}</dd>
    </div>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
    pending_review: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status ?? ""] ?? "border-slate-custom-50 bg-cream-50 text-slate-custom-700"}`}>
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