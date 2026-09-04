"use client";

import { useEffect, useState } from "react";
import { getSuperAdminShelters } from "@/lib/api";
import { ShelterReviewList } from "@/components/superadmin/ShelterReviewList";
import { SpinnerOverlay } from "@/components/Spinner";
import type { Shelter } from "@/types/shelter";

export default function SuperAdminPendingSheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSuperAdminShelters("pending_review")
      .then(setShelters)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar solicitudes."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Revisión</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-custom-900">Albergues pendientes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-custom-700">
          Aprueba o rechaza solicitudes nuevas de albergues. Al aprobar, el albergue queda activo.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <SpinnerOverlay label="Cargando solicitudes..." />
      ) : (
        <ShelterReviewList
          initialShelters={shelters}
          emptyText="No hay solicitudes pendientes."
          onStatusChange={(updated) => {
            if (updated.approval_status !== "pending_review") {
              setShelters((current) => current.filter((shelter) => shelter.id !== updated.id));
            }
          }}
        />
      )}
    </section>
  );
}