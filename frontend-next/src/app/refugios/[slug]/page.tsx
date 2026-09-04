"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PublicShell } from "@/lib/SimpleViews";
import { friendlyErrorMessage, API_BASE_URL as API } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { DonarModal } from "@/components/DonarModal";
import { ShelterAnimals } from "@/components/ShelterAnimals";
import { HelpToggle } from "@/components/HelpToggle";
import { SocialLinksRow, type SocialLinks } from "@/components/SocialIcons";

type Sponsor = { id: number; name: string; logo_path: string; url: string | null };
type Shelter = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sponsors?: Sponsor[];
  social_links?: SocialLinks;
};

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  gift: "M20 12v9H4v-9M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  chart: "M3 3v18h18M8 17V9m4 8V5m4 12v-6",
};

const TONES = {
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
      <PublicShell>
        <section className="grid w-full gap-4 px-6 py-12">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-cream-100" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-32 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
            <div className="h-32 animate-pulse rounded-2xl border border-slate-custom-50 bg-white sm:col-span-2" />
          </div>
        </section>
      </PublicShell>
    );
  }

  if (error || !shelter) {
    return (
      <PublicShell>
        <section className="grid w-full gap-4 px-6 py-12">
          <h1 className="text-3xl font-semibold text-slate-custom-900">Refugio no encontrado</h1>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error || "No encontramos este refugio."}
          </div>
        </section>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="grid w-full gap-6 px-6 py-12">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{shelter.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-custom-700">
            {shelter.description || "Albergue registrado en Refugio360."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-6">
          {/* Acciones */}
          <div className="grid content-start gap-4 lg:col-span-1">
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

            {shelter.social_links && Object.values(shelter.social_links).some(Boolean) && (
              <div className="rounded-2xl border border-slate-custom-50 bg-white p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-custom-500">Síguenos</p>
                <SocialLinksRow links={shelter.social_links} />
              </div>
            )}
          </div>

          {/* Animales */}
          <div className="lg:col-span-4">
            <ShelterAnimals slug={String(slug)} />
          </div>

          {/* Aliados, a la derecha de los animales */}
          {shelter.sponsors && shelter.sponsors.length > 0 && (
            <div className="space-y-3 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-custom-500">
                Con el apoyo de
              </p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-2">
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
                    <a key={sponsor.id} href={sponsor.url} target="_blank" rel="noopener noreferrer" title={sponsor.name}>
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
      </section>

      {showDonar && <DonarModal slug={String(slug)} onClose={() => setShowDonar(false)} />}
    </PublicShell>
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

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-slate-custom-50 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-600/20">
      {/* Área clicable de toda la tarjeta (navega o dispara la acción) */}
      {onClick ? (
        <button type="button" onClick={onClick} aria-label={title} className="absolute inset-0 rounded-2xl" />
      ) : (
        <Link href={href!} aria-label={title} className="absolute inset-0 rounded-2xl" />
      )}

      <div className="pointer-events-none relative z-10 flex items-center gap-2">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 ${t.badge} group-hover:bg-white/20 group-hover:text-white`}
        >
          <Icon path={icon} className="h-5 w-5" />
        </span>
        <span className="pointer-events-auto">
          <HelpToggle label={`Sobre ${title}`}>{description}</HelpToggle>
        </span>
      </div>

      <p className="pointer-events-none relative z-10 font-semibold text-slate-custom-900 transition-colors duration-200 group-hover:text-white">
        {title}
      </p>
    </div>
  );
}