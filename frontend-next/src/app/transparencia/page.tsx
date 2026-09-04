"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL as API } from "@/lib/api";
import { DonarModal } from "@/components/DonarModal";

type Shelter = { id: number; name: string; slug: string; description: string | null; accepts_donations: boolean };

export default function TransparenciaPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [donarSlug, setDonarSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/public/shelters`, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setShelters(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-cream-100 text-slate-custom-900">
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-10">
        <div className="border-b border-slate-custom-50 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">Transparencia</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Reportes públicos por albergue</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-custom-700">Consulta ingresos aprobados, gastos registrados y balance de cada refugio.</p>
        </div>

        {loading && <p className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 text-sm text-slate-500">Cargando...</p>}

        <div className="grid gap-4 md:grid-cols-2">
          {shelters.map((shelter) => (
            <article key={shelter.id} className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
              <h2 className="text-xl font-semibold">{shelter.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-custom-700">{shelter.description || "Albergue registrado en Refugio360."}</p>
              <div className="mt-5 flex gap-2">
                <Link href={`/refugios/${shelter.slug}/transparencia`} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Ver reporte</Link>
                {shelter.accepts_donations && (
                  <button
                    type="button"
                    onClick={() => setDonarSlug(shelter.slug)}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-custom-700"
                  >
                    Donar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {donarSlug && <DonarModal slug={donarSlug} onClose={() => setDonarSlug(null)} />}
    </main>
  );
}
