import type { Animal } from "@/types/animal";
import type { Adoption, CreateAdoptionPayload } from "@/types/adoption";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

// ─── Animales ────────────────────────────────────────────────────────────────

type GetAnimalsParams = {
  status?: string;
};

export async function getAnimals(
  params: GetAnimalsParams = {}
): Promise<Animal[]> {
  const url = new URL(`${API_BASE_URL}/animals`);
  if (params.status) url.searchParams.set("status", params.status);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al cargar animales: ${res.status}`);
  return res.json();
}

export async function getAnimal(id: number | string): Promise<Animal> {
  const res = await fetch(`${API_BASE_URL}/animals/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Animal no encontrado: ${res.status}`);
  return res.json();
}

// ─── Adopciones ──────────────────────────────────────────────────────────────

export async function createAdoption(
  payload: CreateAdoptionPayload
): Promise<Adoption> {
  const res = await fetch(`${API_BASE_URL}/adoptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body?.message ?? `Error al registrar postulación: ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}