"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { friendlyErrorMessage } from "@/lib/api";
import type { Animal } from "@/types/animal";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

export default function RefugioAnimalDetailPage() {
  const { animalId } = useParams<{ slug: string; animalId: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/animals/${animalId}`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar la ficha de este animal.");
        return r.json();
      })
      .then(setAnimal)
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudo cargar la ficha de este animal.")))
      .finally(() => setLoading(false));
  }, [animalId]);

  if (loading) {
    return (
      <SimplePage title="Cargando ficha..." description=" ">
        <div className="h-64 animate-pulse rounded-lg border border-slate-custom-50 bg-cream-50" />
      </SimplePage>
    );
  }

  if (error || !animal) {
    return (
      <SimplePage title="Ficha del animal" description="Información pública del animal.">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error || "No encontramos este animal."}
        </div>
      </SimplePage>
    );
  }

  const photo = animal.photos?.[0];

  return (
    <SimplePage title={animal.name} description={animal.health_status ?? "Información pública del animal."}>
      <div className="grid gap-5 rounded-lg border border-slate-custom-50 bg-cream-50 p-5 sm:grid-cols-[240px_1fr]">
        <div className="flex h-56 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-6xl sm:h-full">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${STORAGE}/${photo.photo_path}`} alt={animal.name} className="h-full w-full object-cover" />
          ) : (
            <span>🐾</span>
          )}
        </div>
        <div className="grid gap-2">
          <p className="text-sm text-slate-custom-700">Especie: <span className="font-medium capitalize">{animal.species}</span></p>
          <p className="text-sm text-slate-custom-700">Estado: <span className="font-medium">{animal.lifecycle_status}</span></p>
          {animal.estimated_age != null && (
            <p className="text-sm text-slate-custom-700">Edad estimada: <span className="font-medium">{animal.estimated_age} meses</span></p>
          )}
          <Link href={`/login?next=/adoptar/${animalId}`} className="mt-4 inline-block w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Solicitar adopción
          </Link>
        </div>
      </div>
    </SimplePage>
  );
}
