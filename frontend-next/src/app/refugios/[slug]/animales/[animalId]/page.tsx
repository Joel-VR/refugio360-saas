import type { Metadata } from "next";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { API_BASE_URL as API } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { buildAnimalShareText } from "@/lib/animalLabels";
import type { Animal } from "@/types/animal";
import { AnimalDetailClient } from "./AnimalDetailClient";

type Params = { slug: string; animalId: string };

async function fetchAnimal(animalId: string): Promise<Animal | null> {
  const res = await fetch(`${API}/animals/${animalId}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { animalId } = await params;
  const animal = await fetchAnimal(animalId);
  if (!animal) return { title: "Animal no encontrado - Refugio360" };

  const title = `${animal.name} - Refugio360`;
  const description = buildAnimalShareText(animal);
  const photo = animal.photos?.[0];
  const images = photo ? [mediaUrl(photo.photo_path)] : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images, type: "website" },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function RefugioAnimalDetailPage({ params }: { params: Promise<Params> }) {
  const { slug, animalId } = await params;
  const animal = await fetchAnimal(animalId);

  if (!animal) {
    return (
      <SimplePage title="Ficha del animal" description="Información pública del animal.">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            href={`/refugios/${slug}/animales`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
          >
            Volver al listado
          </Link>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            No encontramos este animal.
          </div>
        </div>
      </SimplePage>
    );
  }

  return (
    <SimplePage title={`Ficha de ${animal.name}`} description="Información detallada para el proceso de adopción.">
      <AnimalDetailClient animal={animal} slug={slug} animalId={animalId} />
    </SimplePage>
  );
}
