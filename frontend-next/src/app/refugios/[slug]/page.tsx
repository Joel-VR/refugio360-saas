"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { friendlyErrorMessage } from "@/lib/api";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type Shelter = { id: number; name: string; slug: string; description: string | null };

export default function RefugioProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <SimplePage title="Cargando refugio..." description=" ">
        <div className="h-24 animate-pulse rounded-lg border border-slate-custom-50 bg-cream-50" />
      </SimplePage>
    );
  }

  if (error || !shelter) {
    return (
      <SimplePage title="Refugio" description="Perfil público del refugio.">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error || "No encontramos este refugio."}
        </div>
      </SimplePage>
    );
  }

  return (
    <SimplePage title={shelter.name} description={shelter.description ?? "Perfil público del refugio."}>
      <div className="flex flex-wrap gap-3">
        <Link href={`/refugios/${slug}/animales`} className="rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white">Ver animales</Link>
        <Link href={`/login?next=/refugios/${slug}/donar`} className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold">Donar</Link>
        <Link href={`/refugios/${slug}/transparencia`} className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold">Transparencia</Link>
      </div>
    </SimplePage>
  );
}
