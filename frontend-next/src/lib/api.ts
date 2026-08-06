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

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "natural_person" | "shelter_admin" | "super_admin" | string;
  status?: boolean;
  shelter_id: number | null;
  shelter?: Pick<Shelter, "id" | "name" | "approval_status" | "is_active"> | null;
  profile_photo_path?: string | null;
  profile_photo_url?: string | null;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function storeSession({ token, user }: AuthResponse) {
  window.localStorage.setItem("auth_token", token);
  window.localStorage.setItem("user_role", user.role);
  window.localStorage.setItem("auth_user", JSON.stringify(user));
}

export function storeAuthUser(user: AuthUser) {
  window.localStorage.setItem("user_role", user.role);
  window.localStorage.setItem("auth_user", JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("user_role");
  window.localStorage.removeItem("auth_user");
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers, ...fetchOptions } = options ?? {};

  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...fetchOptions,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...authHeaders(),
      ...headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      const firstValidationError = body?.errors
        ? Object.values(body.errors).flat().at(0)
        : null;
      message = String(firstValidationError ?? body?.message ?? message);
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
    headers: { Accept: "application/json", ...authHeaders() },
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
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
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

// ─── Autenticación ───────────────────────────────────────────────────────────

export async function registerPerson(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string; user: AuthUser }> {
  return apiFetch("/auth/register/persona", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerShelter(payload: {
  shelter_name: string;
  responsible_name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string; user: AuthUser; shelter: Shelter }> {
  return apiFetch("/auth/register/albergue", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<{ user: AuthUser }> {
  return apiFetch("/auth/me");
}

export async function updateProfile(payload: {
  name: string;
  email: string;
}): Promise<{ message: string; user: AuthUser }> {
  return apiFetch("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updatePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  return apiFetch("/auth/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateProfilePhoto(file: File): Promise<{ message: string; user: AuthUser }> {
  const body = new FormData();
  body.append("photo", file);

  const res = await fetch(`${API_BASE_URL}/auth/profile/photo`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
    body,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const firstValidationError = payload?.errors
      ? Object.values(payload.errors).flat().at(0)
      : null;
    throw new Error(String(firstValidationError ?? payload?.message ?? `HTTP ${res.status}`));
  }

  return res.json();
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST", body: "{}" });
  clearSession();
}

// ─── Super Admin ────────────────────────────────────────────────────────────

export type SuperAdminDashboard = {
  stats: {
    shelters_total: number;
    shelters_pending: number;
    shelters_approved: number;
    shelters_rejected: number;
    users_total: number;
    natural_people: number;
    shelter_admins: number;
    animals_total: number;
    lost_posts_pending: number;
    found_posts_pending: number;
  };
  pending_shelters: Shelter[];
};

export type SuperAdminUser = AuthUser & {
  shelter?: Pick<Shelter, "id" | "name" | "approval_status" | "is_active"> | null;
  created_at?: string;
};

export async function getSuperAdminDashboard(): Promise<SuperAdminDashboard> {
  return apiFetch("/superadmin/dashboard");
}

export async function getSuperAdminShelters(status?: string): Promise<Shelter[]> {
  const path = status ? `/superadmin/shelters?status=${encodeURIComponent(status)}` : "/superadmin/shelters";
  return apiFetch(path);
}

export async function updateSuperAdminShelterStatus(
  id: number,
  approval_status: "approved" | "rejected"
): Promise<Shelter> {
  return apiFetch(`/superadmin/shelters/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ approval_status }),
  });
}

export async function getSuperAdminUsers(): Promise<SuperAdminUser[]> {
  return apiFetch("/superadmin/users");
}
