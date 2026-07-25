"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import type { Animal } from "@/types/animal";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export default function RefugioAnimalsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    fetch(`${API}/public/shelters/${slug}/animals`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAnimals(Array.isArray(data) ? data : []));
  }, [slug]);

  return (
    <SimplePage title="Animales del refugio" description="Puedes visualizar fichas. Para solicitar adopción se pedirá iniciar sesión.">
      <div className="grid gap-4 md:grid-cols-3">
        {animals.map((animal) => (
          <article key={animal.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">{animal.name}</h2>
            <p className="text-sm text-slate-600">{animal.species} · {animal.lifecycle_status}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/refugios/${slug}/animales/${animal.id}`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">Ver ficha</Link>
              <Link href={`/login?next=/refugios/${slug}/animales/${animal.id}/adoptar`} className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white">Solicitar adopción</Link>
            </div>
          </article>
        ))}
      </div>
    </SimplePage>
  );
}
