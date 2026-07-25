"use client";

import { useEffect, useState } from "react";
import { getSuperAdminShelters } from "@/lib/api";
import { ShelterReviewList } from "@/components/superadmin/ShelterReviewList";
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
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Revisión</p>
        <h1 className="mt-2 text-3xl font-semibold">Albergues pendientes</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Aprueba o rechaza solicitudes nuevas de albergues. Al aprobar, el albergue queda activo.</p>
      </div>

      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      {loading ? (
        <p className="rounded-lg border border-white/10 bg-white/5 p-5 text-sm text-slate-300">Cargando solicitudes...</p>
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
