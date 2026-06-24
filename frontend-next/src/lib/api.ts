import type { Animal } from "@/types/animal";
import type { Adoption, CreateAdoptionPayload } from "@/types/adoption";
import type { Shelter, CreateShelterPayload } from "@/types/shelter";
import type { DashboardStats } from "@/types/dashboard";

/*
 * IMPORTANTE: el backend Laravel sirve las rutas bajo /api/ automáticamente.
 * routes/api.php define  v1/shelters  → URL real: /api/v1/shelters
 *
 * Si no tienes .env.local, el fallback apunta a http://localhost:8000/api/v1
 * Para cambiarlo crea frontend-next/.env.local con:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

// ─── Utilidad interna ─────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // respuesta no-JSON (ej. HTML de error de Laravel)
    }
    throw new Error(`${message} — ${API_BASE_URL}${path}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// ─── Animales ────────────────────────────────────────────────────────────────

export async function getAnimals(
  params: { status?: string } = {}
): Promise<Animal[]> {
  const url = new URL(`${API_BASE_URL}/animals`);
  if (params.status) url.searchParams.set("status", params.status);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al cargar animales: ${res.status}`);
  return res.json();
}
export async function getAnimal(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/animals/${id}`, {
    headers: { Accept: "application/json" },
    // si necesitas cache, añade next: { revalidate: ... }
  });
  if (!res.ok) throw new Error("Error al obtener el animal");
  return res.json();
}
/* export async function getAnimal(id: number | string): Promise<Animal> {
  const res = await fetch(`${API_BASE_URL}/animals/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Animal no encontrado: ${res.status}`);
  return res.json();
}

export async function deleteAnimal(id: number): Promise<void> {
  await apiFetch(`/animals/${id}`, { method: "DELETE" });
} */

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
    throw new Error(
      body?.message ?? `Error al registrar postulación: ${res.status}`
    );
  }
  return res.json();
}

export async function getAdoptions(
  params: { status?: string; animal_id?: number } = {}
): Promise<Adoption[]> {
  const url = new URL(`${API_BASE_URL}/adoptions`);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.animal_id)
    url.searchParams.set("animal_id", String(params.animal_id));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al cargar adopciones: ${res.status}`);
  return res.json();
}

export async function updateAdoptionStatus(
  id: number,
  status: string,
  notes?: string
): Promise<Adoption> {
  return apiFetch(`/adoptions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  });
}

export async function deleteAdoption(id: number): Promise<void> {
  await apiFetch(`/adoptions/${id}`, { method: "DELETE" });
}

// ─── Albergues ───────────────────────────────────────────────────────────────

export async function getShelters(onlyActive = false): Promise<Shelter[]> {
  const url = new URL(`${API_BASE_URL}/shelters`);
  if (onlyActive) url.searchParams.set("only_active", "true");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al cargar albergues: ${res.status}`);
  return res.json();
}

export async function getShelter(id: number | string): Promise<Shelter> {
  return apiFetch(`/shelters/${id}`);
}

export async function createShelter(
  payload: CreateShelterPayload
): Promise<Shelter> {
  return apiFetch("/shelters", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateShelter(
  id: number,
  payload: Partial<CreateShelterPayload>
): Promise<Shelter> {
  return apiFetch(`/shelters/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleShelterActive(id: number): Promise<Shelter> {
  return apiFetch(`/shelters/${id}/toggle`, { method: "PATCH", body: "{}" });
}

export async function deleteShelter(id: number): Promise<void> {
  await apiFetch(`/shelters/${id}`, { method: "DELETE" });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch("/dashboard/stats");
}
