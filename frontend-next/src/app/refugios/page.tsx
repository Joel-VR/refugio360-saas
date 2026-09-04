"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PublicShell } from "@/lib/SimpleViews";
import { friendlyErrorMessage, API_BASE_URL as API } from "@/lib/api";
import { DonarModal } from "@/components/DonarModal";
import { HelpToggle } from "@/components/HelpToggle";
import { Spinner } from "@/components/Spinner";

const ShelterMap = dynamic(() => import("@/components/ShelterMap").then((m) => m.ShelterMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-custom-50/40">
      <Spinner />
    </div>
  ),
});

type Shelter = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  accepts_donations: boolean;
  latitude: number | null;
  longitude: number | null;
};

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  gift: "M20 12v9H4v-9M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  arrowRight: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
  building: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5s.75 0 .75.75v1.5s0 .75-.75.75H9s-.75 0-.75-.75v-1.5s0-.75.75-.75zm6 0h1.5s.75 0 .75.75v1.5s0 .75-.75.75H15s-.75 0-.75-.75v-1.5s0-.75.75-.75zM9 12h1.5s.75 0 .75.75v1.5s0 .75-.75.75H9s-.75 0-.75-.75v-1.5s0-.75.75-.75zm6 0h1.5s.75 0 .75.75v1.5s0 .75-.75.75H15s-.75 0-.75-.75v-1.5s0-.75.75-.75z",
};

export default function RefugiosPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donarSlug, setDonarSlug] = useState<string | null>(null);

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

  const mappedShelters = useMemo(
    () =>
      shelters
        .filter((s): s is Shelter & { latitude: number; longitude: number } => s.latitude != null && s.longitude != null)
        .map((s) => ({ id: s.id, name: s.name, slug: s.slug, latitude: s.latitude, longitude: s.longitude })),
    [shelters]
  );

  return (
    <PublicShell fullHeight>
      <section className="flex w-full flex-col gap-4 px-6 py-6 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">Refugios registrados</h1>
          <HelpToggle label="Ayuda sobre esta página">
            El visitante solo visualiza. Para donar o solicitar adopción se pedirá iniciar sesión.
          </HelpToggle>
        </div>

        {/* Carga */}
        {loading && <div className="h-96 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
        )}

        {/* Lista vacía */}
        {!loading && !error && shelters.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-custom-50 bg-cream-50/50 p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-custom-400 shadow-sm">
              <Icon path={ICONS.building} className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-custom-900">No hay refugios disponibles</p>
            <p className="mt-1 text-xs text-slate-custom-700">Todavía no hay refugios aprobados para mostrar.</p>
          </div>
        )}

        {/* Mapa (izquierda, 2/3) + lista (derecha, 1/3), sin scroll de página en lg+: solo la lista scrollea */}
        {!loading && !error && shelters.length > 0 && (
          <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row">
            <div className="isolate h-[420px] overflow-hidden rounded-2xl border border-slate-custom-50 lg:h-full lg:flex-[2]">
              <ShelterMap shelters={mappedShelters} />
            </div>

            <div className="grid content-start gap-3 lg:h-full lg:flex-[1] lg:overflow-y-auto lg:pr-1">
              {shelters.map((shelter) => (
                <article
                  key={shelter.id}
                  className="group rounded-2xl border border-slate-custom-50 bg-white p-4 transition hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold text-slate-custom-900 transition group-hover:text-brand-600">
                      {shelter.name}
                    </h2>
                    {shelter.accepts_donations && (
                      <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Icon path={ICONS.gift} className="h-3 w-3" />
                        Donaciones
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-custom-700 line-clamp-2">
                    {shelter.description || "Albergue registrado en Refugio360."}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/refugios/${shelter.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      Ver perfil
                      <Icon path={ICONS.arrowRight} className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDonarSlug(shelter.slug)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition-colors duration-200 hover:border-sky-600 hover:bg-sky-600 hover:text-white"
                    >
                      <Icon path={ICONS.gift} className="h-3.5 w-3.5" />
                      Donar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {donarSlug && <DonarModal slug={donarSlug} onClose={() => setDonarSlug(null)} />}
      </section>
    </PublicShell>
  );
}