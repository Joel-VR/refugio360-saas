"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { ShelterAnimals } from "@/components/ShelterAnimals";

function BackButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/refugios/${slug}`}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Volver al refugio
    </Link>
  );
}

export default function RefugioAnimalsPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <SimplePage title="Animales del refugio" description="Puedes visualizar sus fichas. Para solicitar adopción se pedirá iniciar sesión.">
      <div className="-mt-4 flex flex-col gap-5">
        <BackButton slug={slug} />
        <ShelterAnimals slug={slug} />
      </div>
    </SimplePage>
  );
}

