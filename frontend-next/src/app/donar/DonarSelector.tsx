"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

type PublicShelter = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_path: string | null;
  accepts_donations: boolean;
  payment_methods: {
    yape: { enabled: boolean };
    plin: { enabled: boolean };
  };
};

export default function DonarSelector() {
  const [shelters, setShelters] = useState<PublicShelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/public/shelters`, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar los albergues.");
        return r.json();
      })
      .then((data) => setShelters(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : "Error inesperado."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-cream-100 text-slate-custom-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:py-14">
        <div className="flex flex-col gap-3 border-b border-slate-custom-50 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">Donaciones</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Elige el albergue que quieres apoyar</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-custom-700">
                Cada refugio configura sus propios datos de Yape y Plin. Tu comprobante quedará pendiente de verificación por el equipo del albergue.
              </p>
            </div>
            <Link href="/transparencia" className="w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-custom-700 hover:bg-cream-50">
              Ver transparencia
            </Link>
          </div>
        </div>

        {loading && <p className="rounded-xl border border-slate-custom-50 bg-cream-50 px-5 py-4 text-sm text-slate-500">Cargando albergues...</p>}
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shelters.map((shelter) => (
            <article key={shelter.id} className="flex min-h-72 flex-col justify-between rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-custom-50 bg-slate-100">
                  {shelter.logo_path ? (
                    <img src={`${STORAGE}/${shelter.logo_path}`} alt={shelter.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-600">{shelter.name.slice(0, 1)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-custom-900">{shelter.name}</h2>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-custom-700">{shelter.description || "Albergue registrado en Refugio360."}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-3 py-1 font-semibold ${shelter.payment_methods.yape.enabled ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-500"}`}>
                    Yape {shelter.payment_methods.yape.enabled ? "activo" : "no configurado"}
                  </span>
                  <span className={`rounded-full px-3 py-1 font-semibold ${shelter.payment_methods.plin.enabled ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-500"}`}>
                    Plin {shelter.payment_methods.plin.enabled ? "activo" : "no configurado"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/refugios/${shelter.slug}/donar`}
                    aria-disabled={!shelter.accepts_donations}
                    className={`flex-1 rounded-md px-4 py-3 text-center text-sm font-semibold ${
                      shelter.accepts_donations ? "bg-brand-600 text-white hover:bg-teal-800" : "pointer-events-none bg-slate-200 text-slate-500"
                    }`}
                  >
                    Donar
                  </Link>
                  <Link href={`/refugios/${shelter.slug}/transparencia`} className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-custom-700 hover:bg-cream-100">
                    Transparencia
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!loading && !error && shelters.length === 0 && (
          <p className="rounded-xl border border-slate-custom-50 bg-cream-50 px-5 py-4 text-sm text-slate-500">Aún no hay albergues activos para recibir donaciones.</p>
        )}
      </section>
    </main>
  );
}
