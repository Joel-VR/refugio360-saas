"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import type { Animal } from "@/types/animal";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export default function RefugioAnimalDetailPage() {
  const { slug, animalId } = useParams<{ slug: string; animalId: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    fetch(`${API}/animals/${animalId}`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setAnimal);
  }, [animalId]);

  return (
    <SimplePage title={animal?.name ?? "Ficha del animal"} description={animal?.health_status ?? "Información pública del animal."}>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">Especie: {animal?.species ?? "-"}</p>
        <p className="text-sm text-slate-600">Estado: {animal?.lifecycle_status ?? "-"}</p>
        <Link href={`/login?next=/refugios/${slug}/animales/${animalId}/adoptar`} className="mt-4 inline-block rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
          Solicitar adopción
        </Link>
      </div>
    </SimplePage>
  );
}
