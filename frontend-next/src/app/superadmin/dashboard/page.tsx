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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Super admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-custom-900">Panel de revisión</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-custom-700">
            Gestiona solicitudes de albergues y revisa el estado general de la plataforma.
          </p>
        </div>
        <Link
          href="/superadmin/albergues/pendientes"
          className="w-fit rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 hover:shadow-md"
        >
          Revisar pendientes
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric
          label="Albergues pendientes"
          value={data?.stats.shelters_pending}
          tone="brand"
          icon={<path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />}
        />
        <Metric
          label="Albergues aprobados"
          value={data?.stats.shelters_approved}
          tone="emerald"
          icon={<path d="m9 12 2 2 4-4M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" />}
        />
        <Metric
          label="Usuarios registrados"
          value={data?.stats.users_total}
          tone="sky"
          icon={<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />}
        />
        <Metric
          label="Animales registrados"
          value={data?.stats.animals_total}
          tone="amber"
          icon={<path d="M12 12c-1.657 0-3 1.567-3 3.5S10.343 19 12 19s3-1.567 3-3.5S13.657 12 12 12zm-4.5-1c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm9 0c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-11-4c.967 0 1.75-.783 1.75-1.75S5.467 3.5 4.5 3.5 2.75 4.283 2.75 5.25 3.533 7 4.5 7zm15 0c.967 0 1.75-.783 1.75-1.75S20.467 3.5 19.5 3.5s-1.75.783-1.75 1.75.783 1.75 1.75 1.75z" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/superadmin/albergues"
          className="group rounded-lg border border-slate-custom-50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5"
        >
          <h2 className="text-lg font-semibold text-slate-custom-900">Albergues</h2>
          <p className="mt-2 text-sm text-slate-custom-700">{data?.stats.shelters_total ?? "..."} registros totales.</p>
        </Link>
        <Link
          href="/superadmin/publicaciones/perdidas"
          className="group rounded-lg border border-slate-custom-50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5"
        >
          <h2 className="text-lg font-semibold text-slate-custom-900">Mascotas perdidas</h2>
          <p className="mt-2 text-sm text-slate-custom-700">Pendientes de revisión: {data?.stats.lost_posts_pending ?? 0}.</p>
        </Link>
        <Link
          href="/superadmin/publicaciones/encontradas"
          className="group rounded-lg border border-slate-custom-50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5"
        >
          <h2 className="text-lg font-semibold text-slate-custom-900">Mascotas encontradas</h2>
          <p className="mt-2 text-sm text-slate-custom-700">Pendientes de revisión: {data?.stats.found_posts_pending ?? 0}.</p>
        </Link>
      </div>

      <section className="grid gap-4 rounded-2xl border border-slate-custom-50 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Acción requerida</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-custom-900">Albergues por revisar</h2>
          </div>
          <Link href="/superadmin/albergues/pendientes" className="text-sm font-semibold text-brand-600 hover:underline">
            Ver todos
          </Link>
        </div>
        {data ? (
          <ShelterReviewList initialShelters={data.pending_shelters} emptyText="No hay albergues pendientes de revisión." />
        ) : (
          <p className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 text-sm text-slate-custom-700">Cargando solicitudes...</p>
        )}
      </section>
    </section>
  );
}

const TONES = {
  brand: { badge: "bg-brand-600/10 text-brand-600", border: "border-brand-600/30 bg-brand-600/5", value: "text-brand-600" },
  emerald: { badge: "bg-emerald-100 text-emerald-700", border: "border-slate-custom-50 bg-white", value: "text-emerald-700" },
  sky: { badge: "bg-sky-100 text-sky-700", border: "border-slate-custom-50 bg-white", value: "text-sky-700" },
  amber: { badge: "bg-amber-100 text-amber-700", border: "border-slate-custom-50 bg-white", value: "text-amber-700" },
} as const;

function Metric({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value?: number;
  tone: keyof typeof TONES;
  icon: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className={`rounded-lg border p-5 ${t.border}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-custom-700">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${t.badge}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5">
            {icon}
          </svg>
        </span>
      </div>
      <p className={`mt-3 text-3xl font-semibold ${t.value}`}>{value ?? "..."}</p>
    </div>
  );
}