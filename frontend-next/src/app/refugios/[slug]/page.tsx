"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SimplePage } from "@/lib/SimpleViews";
import { friendlyErrorMessage, API_BASE_URL as API } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { DonarModal } from "@/components/DonarModal";

type Sponsor = { id: number; name: string; logo_path: string; url: string | null };
type Shelter = { id: number; name: string; slug: string; description: string | null; sponsors?: Sponsor[] };

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  back: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18",
  paw: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  gift: "M20 12v9H4v-9M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  chart: "M3 3v18h18M8 17V9m4 8V5m4 12v-6",
};

const TONES = {
  violet: { badge: "bg-violet-100 text-violet-700" },
  sky: { badge: "bg-sky-100 text-sky-700" },
  emerald: { badge: "bg-emerald-100 text-emerald-700" },
} as const;

export default function RefugioProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDonar, setShowDonar] = useState(false);

  useEffect(() => {
    fetch(`${API}/public/shelters/${slug}`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("No encontramos este refugio.");
        return r.json();
      })
      .then(setShelter)
      .catch((err) => setError(friendlyErrorMessage(err, "No encontramos este refugio.")))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <SimplePage title="Cargando refugio..." description="Cargando información del albergue seleccionado...">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-32 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
          <div className="h-32 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
          <div className="h-32 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
        </div>
      </SimplePage>
    );
  }

  if (error || !shelter) {
    return (
      <SimplePage title="Refugio no encontrado" description="No pudimos obtener la información del refugio.">
        <div className="space-y-4">
          <Link
            href="/refugios"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
          >
            <Icon path={ICONS.back} className="h-4 w-4" />
            Volver a refugios
          </Link>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error || "No encontramos este refugio."}
          </div>
        </div>
      </SimplePage>
    );
  }

  return (
    <SimplePage
      title={shelter.name}
      description={shelter.description || "Albergue registrado en Refugio360."}
    >
      <div className="-mt-2 space-y-6">
        {/* Botón Volver */}
        <div>
          <Link
            href="/refugios"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
          >
            <Icon path={ICONS.back} className="h-4 w-4" />
            Volver a refugios
          </Link>
        </div>

        {/* Acciones del refugio */}
        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard
            tone="violet"
            icon={ICONS.paw}
            href={`/refugios/${slug}/animales`}
            title="Ver animales"
            description="Conoce a los animales disponibles para adopción en este refugio."
          />
          <ActionCard
            tone="sky"
            icon={ICONS.gift}
            onClick={() => setShowDonar(true)}
            title="Donar"
            description="Apoya a este refugio con donaciones monetarias directamente."
          />
          <ActionCard
            tone="emerald"
            icon={ICONS.chart}
            href={`/refugios/${slug}/transparencia`}
            title="Transparencia"
            description="Revisa el historial de ingresos y gastos registrados de este refugio."
          />
        </div>

        {/* Insignias de instituciones aliadas */}
        {shelter.sponsors && shelter.sponsors.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-custom-500">
              Con el apoyo de
            </p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
              {shelter.sponsors.map((sponsor) => {
                const badge = (
                  <div className="relative h-14 w-14 rounded-xl border border-slate-custom-50 bg-white p-2 transition hover:border-brand-600/40">
                    <Image
                      src={mediaUrl(sponsor.logo_path)}
                      alt={sponsor.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1.5"
                    />
                  </div>
                );

                return sponsor.url ? (
                  <a
                    key={sponsor.id}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={sponsor.name}
                  >
                    {badge}
                  </a>
                ) : (
                  <div key={sponsor.id} title={sponsor.name}>
                    {badge}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showDonar && <DonarModal slug={String(slug)} onClose={() => setShowDonar(false)} />}
    </SimplePage>
  );
}

function ActionCard({
  tone,
  icon,
  href,
  onClick,
  title,
  description,
}: {
  tone: keyof typeof TONES;
  icon: string;
  href?: string;
  onClick?: () => void;
  title: string;
  description: string;
}) {
  const t = TONES[tone];
  const content = (
    <>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 ${t.badge} group-hover:bg-white/20 group-hover:text-white`}
      >
        <Icon path={icon} className="h-5 w-5" />
      </span>

      <div>
        <p className="font-semibold text-slate-custom-900 transition-colors duration-200 group-hover:text-white">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-custom-700 transition-colors duration-200 group-hover:text-white/90">
          {description}
        </p>
      </div>
    </>
  );
  const className =
    "group flex flex-col justify-between gap-4 rounded-2xl border border-slate-custom-50 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-600/20";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href!} className={className}>
      {content}
    </Link>
  );
}