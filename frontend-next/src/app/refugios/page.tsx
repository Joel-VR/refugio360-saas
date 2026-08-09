"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { friendlyErrorMessage, getStoredToken } from "@/lib/api";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

type Shelter = { id: number; name: string; slug: string; description: string | null; accepts_donations: boolean };

export default function RefugiosPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isLoggedIn = Boolean(getStoredToken());

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
    <SimplePage title="Refugios registrados" description="El visitante solo visualiza. Para donar o solicitar adopción se pedirá iniciar sesión.">
      {!isLoggedIn && (
        <div className="rounded-lg border border-brand-600/20 bg-brand-600/5 px-4 py-3 text-sm text-slate-custom-700">
          Estás explorando como visitante. Para donar o solicitar una adopción,{" "}
          <Link href="/registro" className="font-semibold text-brand-600 underline">crea una cuenta</Link> o{" "}
          <Link href="/login" className="font-semibold text-brand-600 underline">inicia sesión</Link>.
        </div>
      )}

      {loading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg border border-slate-custom-50 bg-cream-50" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
      )}

      {!loading && !error && shelters.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-custom-50 bg-cream-50 p-8 text-center text-sm text-slate-custom-700">
          Todavía no hay refugios aprobados para mostrar.
        </div>
      )}

      {!loading && !error && shelters.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {shelters.map((shelter) => (
            <article key={shelter.id} className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
              <h2 className="text-xl font-semibold">{shelter.name}</h2>
              <p className="mt-2 text-sm text-slate-custom-700">{shelter.description || "Albergue registrado en Refugio360."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/refugios/${shelter.slug}`} className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white">Ver perfil</Link>
                <Link href={`/refugios/${shelter.slug}/donar`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">Donar</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </SimplePage>
  );
}
