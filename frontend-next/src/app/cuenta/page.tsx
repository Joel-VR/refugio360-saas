"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { friendlyErrorMessage, getMyAdoptions, getMyDonations, getMyLostFoundPosts, getStoredUser } from "@/lib/api";

type Stats = {
  adoptionsActive: number;
  donationsTotal: number;
  donationsAmount: number;
  postsPending: number;
};

function Icon({ path, className = "h-6 w-6" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  paw: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  coin: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM12 6v12M9 9.5c0-1.38 1.343-2.5 3-2.5s3 1.12 3 2.5-1.343 2.5-3 2.5-3 1.12-3 2.5 1.343 2.5 3 2.5 3-1.12 3-2.5",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  search: "M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM21 21l-5.197-5.197",
  gift: "M20 12v9H4v-9M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  pin: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  check: "M4.5 12.75l6 6 9-13.5",
};

const TONES = {
  brand: { badge: "bg-brand-600/10 text-brand-600", border: "border-brand-600/30 bg-brand-600/5", value: "text-brand-600" },
  emerald: { badge: "bg-emerald-100 text-emerald-700", border: "border-slate-custom-50 bg-white", value: "text-emerald-700" },
  sky: { badge: "bg-sky-100 text-sky-700", border: "border-slate-custom-50 bg-white", value: "text-sky-700" },
  amber: { badge: "bg-amber-100 text-amber-700", border: "border-slate-custom-50 bg-white", value: "text-amber-700" },
  violet: { badge: "bg-violet-100 text-violet-700", border: "border-slate-custom-50 bg-white", value: "text-violet-700" },
} as const;

export default function AccountHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const user = getStoredUser();

  useEffect(() => {
    Promise.all([getMyAdoptions(), getMyDonations(), getMyLostFoundPosts()])
      .then(([adoptions, donations, posts]) => {
        setStats({
          adoptionsActive: adoptions.filter((a) => !["rechazado", "adoptado"].includes(a.status)).length,
          donationsTotal: donations.length,
          donationsAmount: donations
            .filter((d) => d.status === "approved")
            .reduce((sum, d) => sum + Number(d.amount ?? 0), 0),
          postsPending: posts.filter((p) => p.status === "pending_review").length,
        });
      })
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudo cargar tu resumen.")));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
      {/* Encabezado */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-custom-50 bg-white p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-600/5" />
        <div className="pointer-events-none absolute -right-4 top-16 h-20 w-20 rounded-full bg-brand-600/5" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">{greeting}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Hola{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-custom-700">
          Este es el resumen de tu actividad en Refugio360: tus adopciones, donaciones y publicaciones en un solo lugar.
        </p>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="violet" icon={ICONS.paw} label="Adopciones activas" value={stats?.adoptionsActive} href="/cuenta/adopciones" />
        <StatCard tone="sky" icon={ICONS.gift} label="Donaciones realizadas" value={stats?.donationsTotal} href="/cuenta/donaciones" />
        <StatCard tone="emerald" icon={ICONS.coin} label="Total donado (aprobado)" value={stats ? `S/. ${stats.donationsAmount.toFixed(2)}` : undefined} href="/cuenta/donaciones" />
        <StatCard tone="amber" icon={ICONS.clock} label="Publicaciones pendientes" value={stats?.postsPending} href="/cuenta/mascotas-perdidas" />
      </div>

      {/* Acciones rápidas */}
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Acciones rápidas</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickLink icon={ICONS.search} href="/adoptar" title="Buscar animales para adoptar" description="Explora el catálogo de animales disponibles en los refugios." />
          <QuickLink icon={ICONS.gift} href="/donar" title="Hacer una donación" description="Apoya a un refugio con Yape o Plin." />
          <QuickLink icon={ICONS.pin} href="/cuenta/mascotas-perdidas/nueva" title="Publicar mascota perdida" description="Reporta una mascota perdida para que la comunidad la ayude a encontrar." />
          <QuickLink icon={ICONS.check} href="/cuenta/mascotas-encontradas/nueva" title="Reportar mascota encontrada" description="Ayuda a que una mascota encontrada regrese a su hogar." />
        </div>
      </div>
    </section>
  );
}

function StatCard({
  tone,
  icon,
  label,
  value,
  href,
}: {
  tone: keyof typeof TONES;
  icon: string;
  label: string;
  value?: number | string;
  href: string;
}) {
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className={`group rounded-lg border p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand-600/5 ${t.border}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-custom-700">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full transition ${t.badge}`}>
          <Icon path={icon} className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className={`mt-3 text-3xl font-semibold ${t.value}`}>{value ?? "···"}</p>
    </Link>
  );
}

function QuickLink({ icon, href, title, description }: { icon: string; href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-slate-custom-50 bg-cream-50 p-5 transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5"
    >
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm transition group-hover:bg-brand-600 group-hover:text-white">
        <Icon path={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="font-semibold text-slate-custom-900">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-custom-700">{description}</p>
      </div>
    </Link>
  );
}