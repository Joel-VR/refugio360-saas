"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type Shelter = { id: number; name: string; slug: string; description: string | null };

export default function RefugioProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [shelter, setShelter] = useState<Shelter | null>(null);

  useEffect(() => {
    fetch(`${API}/public/shelters/${slug}`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setShelter);
  }, [slug]);

  return (
    <SimplePage title={shelter?.name ?? "Refugio"} description={shelter?.description ?? "Perfil público del refugio."}>
      <div className="flex flex-wrap gap-3">
        <Link href={`/refugios/${slug}/animales`} className="rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white">Ver animales</Link>
        <Link href={`/login?next=/refugios/${slug}/donar`} className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold">Donar</Link>
        <Link href={`/refugios/${slug}/transparencia`} className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold">Transparencia</Link>
      </div>
    </SimplePage>
  );
}
