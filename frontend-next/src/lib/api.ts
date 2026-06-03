import type { Animal } from "@/types/animal";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(
  /\/$/,
  ""
);

type GetAnimalsParams = {
  status?: string;
};

export async function getAnimals(params: GetAnimalsParams = {}): Promise<Animal[]> {
  const url = new URL(`${API_BASE_URL}/animals`);

  if (params.status) {
    url.searchParams.set("status", params.status);
  }

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar los animales: ${response.status}`);
  }

  return response.json();
}
