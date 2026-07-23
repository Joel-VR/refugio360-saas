"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type Shelter = { id: number; name: string; slug: string; description: string | null; accepts_donations: boolean };

export default function TransparenciaPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/public/shelters`, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setShelters(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-slate-950">
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Transparencia</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Reportes públicos por albergue</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Consulta ingresos aprobados, gastos registrados y balance de cada refugio.</p>
        </div>

        {loading && <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">Cargando...</p>}

        <div className="grid gap-4 md:grid-cols-2">
          {shelters.map((shelter) => (
            <article key={shelter.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">{shelter.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{shelter.description || "Albergue registrado en Refugio360."}</p>
              <div className="mt-5 flex gap-2">
                <Link href={`/refugios/${shelter.slug}/transparencia`} className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Ver reporte</Link>
                {shelter.accepts_donations && <Link href={`/refugios/${shelter.slug}/donar`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Donar</Link>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
