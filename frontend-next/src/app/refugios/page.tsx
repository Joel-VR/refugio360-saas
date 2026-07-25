"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type Shelter = { id: number; name: string; slug: string; description: string | null; accepts_donations: boolean };

export default function RefugiosPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    fetch(`${API}/public/shelters`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setShelters(Array.isArray(data) ? data : []));
  }, []);

  return (
    <SimplePage title="Refugios registrados" description="El visitante solo visualiza. Para donar o solicitar adopción se pedirá iniciar sesión.">
      <div className="grid gap-4 md:grid-cols-2">
        {shelters.map((shelter) => (
          <article key={shelter.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold">{shelter.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{shelter.description || "Albergue registrado en Refugio360."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/refugios/${shelter.slug}`} className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white">Ver perfil</Link>
              <Link href={`/login?next=/refugios/${shelter.slug}/donar`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">Donar</Link>
            </div>
          </article>
        ))}
      </div>
    </SimplePage>
  );
}
