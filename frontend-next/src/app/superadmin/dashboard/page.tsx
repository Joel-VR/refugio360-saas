"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSuperAdminDashboard, type SuperAdminDashboard } from "@/lib/api";
import { ShelterReviewList } from "@/components/superadmin/ShelterReviewList";

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<SuperAdminDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSuperAdminDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard."));
  }, []);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Super Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Panel de revisión</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Gestiona solicitudes de albergues y revisa el estado general de la plataforma.
          </p>
        </div>
        <Link href="/superadmin/albergues/pendientes" className="w-fit rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">
          Revisar pendientes
        </Link>
      </div>

      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Albergues pendientes" value={data?.stats.shelters_pending} tone="amber" />
        <Metric label="Albergues aprobados" value={data?.stats.shelters_approved} tone="emerald" />
        <Metric label="Usuarios registrados" value={data?.stats.users_total} tone="cyan" />
        <Metric label="Animales registrados" value={data?.stats.animals_total} tone="slate" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/superadmin/albergues" className="rounded-lg border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
          <h2 className="text-lg font-semibold">Albergues</h2>
          <p className="mt-2 text-sm text-slate-400">{data?.stats.shelters_total ?? "..."} registros totales.</p>
        </Link>
        <Link href="/superadmin/publicaciones/perdidas" className="rounded-lg border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
          <h2 className="text-lg font-semibold">Mascotas perdidas</h2>
          <p className="mt-2 text-sm text-slate-400">Módulo pendiente de modelo de datos. Pendientes actuales: {data?.stats.lost_posts_pending ?? 0}.</p>
        </Link>
        <Link href="/superadmin/publicaciones/encontradas" className="rounded-lg border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
          <h2 className="text-lg font-semibold">Mascotas encontradas</h2>
          <p className="mt-2 text-sm text-slate-400">Módulo pendiente de modelo de datos. Pendientes actuales: {data?.stats.found_posts_pending ?? 0}.</p>
        </Link>
      </div>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Albergues por revisar</h2>
          <Link href="/superadmin/albergues/pendientes" className="text-sm font-semibold text-cyan-300">Ver todos</Link>
        </div>
        {data ? (
          <ShelterReviewList initialShelters={data.pending_shelters} emptyText="No hay albergues pendientes de revisión." />
        ) : (
          <p className="rounded-lg border border-white/10 bg-white/5 p-5 text-sm text-slate-300">Cargando solicitudes...</p>
        )}
      </section>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value?: number; tone: "amber" | "emerald" | "cyan" | "slate" }) {
  const colors = {
    amber: "text-amber-200",
    emerald: "text-emerald-200",
    cyan: "text-cyan-200",
    slate: "text-slate-100",
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${colors[tone]}`}>{value ?? "..."}</p>
    </div>
  );
}
