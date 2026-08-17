"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { friendlyErrorMessage, getStoredToken, API_BASE_URL as API } from "@/lib/api";

type Shelter = { id: number; name: string; slug: string; description: string | null; accepts_donations: boolean };

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  gift: "M20 12v9H4v-9M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  arrowRight: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
  building: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5s.75 0 .75.75v1.5s0 .75-.75.75H9s-.75 0-.75-.75v-1.5s0-.75.75-.75zm6 0h1.5s.75 0 .75.75v1.5s0 .75-.75.75H15s-.75 0-.75-.75v-1.5s0-.75.75-.75zM9 12h1.5s.75 0 .75.75v1.5s0 .75-.75.75H9s-.75 0-.75-.75v-1.5s0-.75.75-.75zm6 0h1.5s.75 0 .75.75v1.5s0 .75-.75.75H15s-.75 0-.75-.75v-1.5s0-.75.75-.75z",
};

export default function RefugiosPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getStoredToken()));
  }, []);

  useEffect(() => {
    fetch(`${API}/public/shelters`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar los refugios.");
        return r.json();
      })
      .then((data) => setShelters(Array.isArray(data) ? data : []))
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudieron cargar los refugios.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SimplePage
      title="Refugios registrados"
      description="El visitante solo visualiza. Para donar o solicitar adopción se pedirá iniciar sesión."
    >
      {/* Alerta si es visitante */}
      {!isLoggedIn && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-600/20 bg-brand-600/5 p-4 text-sm text-slate-custom-700">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600">
            <Icon path={ICONS.info} className="h-4 w-4" />
          </span>
          <div>
            Estás explorando como visitante. Para donar o solicitar una adopción,{" "}
            <Link href="/registro" className="font-semibold text-brand-600 hover:underline">
              crea una cuenta
            </Link>{" "}
            o{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              inicia sesión
            </Link>.
          </div>
        </div>
      )}

      {/* Carga */}
      {loading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between h-36 animate-pulse rounded-2xl border border-slate-custom-50 bg-white p-5"
            >
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded-lg bg-cream-100" />
                <div className="h-4 w-full rounded-lg bg-cream-100" />
              </div>
              <div className="h-8 w-full rounded-xl bg-cream-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Lista Vacía */}
      {!loading && !error && shelters.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-custom-50 bg-cream-50/50 p-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-custom-400 shadow-sm">
            <Icon path={ICONS.building} className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-custom-900">No hay refugios disponibles</p>
          <p className="mt-1 text-xs text-slate-custom-700">Todavía no hay refugios aprobados para mostrar.</p>
        </div>
      )}

      {/* Grilla de refugios compacta */}
      {!loading && !error && shelters.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {shelters.map((shelter) => (
            <article
              key={shelter.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-custom-50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-custom-900 transition group-hover:text-brand-600">
                    {shelter.name}
                  </h2>
                  {shelter.accepts_donations && (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      <Icon path={ICONS.gift} className="h-3 w-3" />
                      Donaciones
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-custom-700 line-clamp-2">
                  {shelter.description || "Albergue registrado en Refugio360."}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/refugios/${shelter.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  Ver perfil
                  <Icon path={ICONS.arrowRight} className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/refugios/${shelter.slug}/donar`}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition-colors duration-200 hover:border-sky-600 hover:bg-sky-600 hover:text-white"
                >
                  <Icon path={ICONS.gift} className="h-3.5 w-3.5" />
                  Donar
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </SimplePage>
  );
}