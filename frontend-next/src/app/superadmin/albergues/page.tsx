"use client";

import { useEffect, useState } from "react";
import { getSuperAdminShelters } from "@/lib/api";
import { ShelterReviewList } from "@/components/superadmin/ShelterReviewList";
import type { Shelter } from "@/types/shelter";

const FILTERS = [
  { label: "Todos", value: "" },
  { label: "Pendientes", value: "pending_review" },
  { label: "Aprobados", value: "approved" },
  { label: "Rechazados", value: "rejected" },
];

export default function SuperAdminSheltersPage() {
  const [status, setStatus] = useState("");
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSuperAdminShelters(status)
      .then(setShelters)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar los albergues."))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Super admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-custom-900">Albergues</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              setStatus(filter.value);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              status === filter.value
                ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                : "border border-slate-custom-50 text-slate-custom-700 hover:bg-cream-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 text-sm text-slate-custom-700">
          Cargando albergues...
        </p>
      ) : (
        <ShelterReviewList initialShelters={shelters} emptyText="No hay albergues para este filtro." />
      )}
    </section>
  );
}