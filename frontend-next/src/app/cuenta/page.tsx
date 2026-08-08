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

  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold">Hola{user?.name ? `, ${user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-slate-custom-700">Este es el resumen de tu actividad en Refugio360.</p>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Adopciones activas" value={stats?.adoptionsActive} href="/cuenta/adopciones" />
        <StatCard label="Donaciones realizadas" value={stats?.donationsTotal} href="/cuenta/donaciones" />
        <StatCard label="Total donado (aprobado)" value={stats ? `S/. ${stats.donationsAmount.toFixed(2)}` : undefined} href="/cuenta/donaciones" />
        <StatCard label="Publicaciones pendientes" value={stats?.postsPending} href="/cuenta/mascotas-perdidas" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickLink href="/adoptar" title="Buscar animales para adoptar" description="Explora el catálogo de animales disponibles en los refugios." />
        <QuickLink href="/donar" title="Hacer una donación" description="Apoya a un refugio con Yape o Plin." />
        <QuickLink href="/cuenta/mascotas-perdidas/nueva" title="Publicar mascota perdida" description="Reporta una mascota perdida para que la comunidad la ayude a encontrar." />
        <QuickLink href="/cuenta/mascotas-encontradas/nueva" title="Reportar mascota encontrada" description="Ayuda a que una mascota encontrada regrese a su hogar." />
      </div>
    </section>
  );
}

function StatCard({ label, value, href }: { label: string; value?: number | string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 transition hover:border-brand-600/30 hover:shadow-sm">
      <p className="text-sm text-slate-custom-700">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-brand-600">{value ?? "…"}</p>
    </Link>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 transition hover:border-brand-600/30 hover:shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-custom-700">{description}</p>
    </Link>
  );
}
