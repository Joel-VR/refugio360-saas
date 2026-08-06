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
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Super Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Albergues</h1>
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
            className={`rounded-md px-4 py-2 text-sm font-semibold ${status === filter.value ? "bg-cyan-300 text-slate-custom-900" : "border border-white/10 text-slate-200 hover:bg-cream-50/10"}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      {loading ? (
        <p className="rounded-lg border border-white/10 bg-cream-50/5 p-5 text-sm text-slate-300">Cargando albergues...</p>
      ) : (
        <ShelterReviewList initialShelters={shelters} emptyText="No hay albergues para este filtro." />
      )}
    </section>
  );
}
