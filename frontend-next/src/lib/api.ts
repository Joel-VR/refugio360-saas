import type { Animal } from "@/types/animal";
import type { Adoption, CreateAdoptionPayload } from "@/types/adoption";
import type { Shelter, CreateShelterPayload } from "@/types/shelter";
import type { DashboardStats } from "@/types/dashboard";
import type { CreateLostFoundPostPayload, LostFoundPost, LostFoundPostType } from "@/types/lostFoundPost";
import type { Donation } from "@/types/donation";

/*
 * IMPORTANTE: el backend Laravel sirve las rutas bajo /api/ automáticamente.
 * routes/api.php define  v1/shelters  → URL real: /api/v1/shelters
 *
 * Si no tienes .env.local, el fallback apunta a http://localhost:8000/api/v1
 * Para cambiarlo crea frontend-next/.env.local con:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
 */
export const API_BASE_URL = (
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

export function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// El token también se guarda en una cookie (no httpOnly) para que los Server
// Components de Next.js puedan leerlo con `next/headers` y reenviarlo a la
// API — localStorage solo es visible desde el navegador.
export function storeSession({ token, user }: AuthResponse) {
  window.localStorage.setItem("auth_token", token);
  window.localStorage.setItem("user_role", user.role);
  window.localStorage.setItem("auth_user", JSON.stringify(user));
  document.cookie = `auth_token=${token}; path=/; SameSite=Lax`;
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
  document.cookie = "auth_token=; path=/; SameSite=Lax; Max-Age=0";
}

export const NETWORK_ERROR_MESSAGE =
  "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.";

export function friendlyErrorMessage(
  err: unknown,
  fallback = "Ocurrió un error inesperado. Inténtalo de nuevo."
): string {
  if (err instanceof TypeError) return NETWORK_ERROR_MESSAGE;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export class ApiAuthError extends Error {}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers, ...fetchOptions } = options ?? {};
  const mergedHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...authHeaders(),
    ...headers,
  };

  // Peticiones autenticadas o de escritura nunca se cachean: pueden traer
  // datos por-usuario o mutar estado. Las lecturas públicas (GET sin token)
  // sí pueden cachearse — respetan el Cache-Control que envía el backend.
  const method = (fetchOptions.method ?? "GET").toUpperCase();
  const isAuthenticated = "Authorization" in mergedHeaders;
  const mustBypassCache = method !== "GET" || isAuthenticated;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...(mustBypassCache ? { cache: "no-store" as const } : {}),
    ...fetchOptions,
    headers: mergedHeaders,
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
      // respuesta no-JSON
    }

    // Solo 401/403 significan "tu sesión ya no es válida"
    if (res.status === 401 || res.status === 403) {
      throw new ApiAuthError(message);
    }
    if (process.env.NODE_ENV !== "production") {
      console.error(`API ${res.status} — ${API_BASE_URL}${path}`);
    }
    throw new Error(message);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// ─── Animales ────────────────────────────────────────────────────────────────

export type PageInfo = { currentPage: number; lastPage: number; total: number };

export function pageInfoFrom(body: { current_page?: number; last_page?: number; total?: number; meta?: { current_page?: number; last_page?: number; total?: number } }): PageInfo {
  return {
    currentPage: body.current_page ?? body.meta?.current_page ?? 1,
    lastPage: body.last_page ?? body.meta?.last_page ?? 1,
    total: body.total ?? body.meta?.total ?? 0,
  };
}

export async function getAnimals(
  params: { status?: string; per_page?: number; page?: number } = {}
): Promise<Animal[]> {
  const { items } = await getAnimalsPage(params);
  return items;
}

export async function getAnimalsPage(
  params: { status?: string; per_page?: number; page?: number } = {}
): Promise<{ items: Animal[]; page: PageInfo }> {
  const url = new URL(`${API_BASE_URL}/animals`);
  if (params.status) url.searchParams.set("status", params.status);
  url.searchParams.set("per_page", String(params.per_page ?? 24));
  if (params.page) url.searchParams.set("page", String(params.page));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al cargar animales: ${res.status}`);
  const body = await res.json();
  return { items: body.data ?? body, page: pageInfoFrom(body) };
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
  params: { status?: string; animal_id?: number; per_page?: number; page?: number } = {},
  extraHeaders: HeadersInit = {}
): Promise<Adoption[]> {
  const { items } = await getAdoptionsPage(params, extraHeaders);
  return items;
}

export async function getAdoptionsPage(
  params: { status?: string; animal_id?: number; per_page?: number; page?: number } = {},
  extraHeaders: HeadersInit = {}
): Promise<{ items: Adoption[]; page: PageInfo }> {
  const url = new URL(`${API_BASE_URL}/adoptions`);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.animal_id)
    url.searchParams.set("animal_id", String(params.animal_id));
  url.searchParams.set("per_page", String(params.per_page ?? 24));
  if (params.page) url.searchParams.set("page", String(params.page));
  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json", ...authHeaders(), ...extraHeaders },
  });
  if (!res.ok) throw new Error(`Error al cargar adopciones: ${res.status}`);
  const body = await res.json();
  return { items: body.data ?? body, page: pageInfoFrom(body) };
}

export async function getMyAdoptions(): Promise<Adoption[]> {
  const body = await apiFetch<{ data: Adoption[] } | Adoption[]>("/adoptions/mine?per_page=50");
  return Array.isArray(body) ? body : body.data;
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

export async function getShelters(
  onlyActive = false,
  extraHeaders: HeadersInit = {}
): Promise<Shelter[]> {
  const url = new URL(`${API_BASE_URL}/shelters`);
  if (onlyActive) url.searchParams.set("only_active", "true");
  url.searchParams.set("per_page", "100");
  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json", ...authHeaders(), ...extraHeaders },
  });
  if (!res.ok) throw new Error(`Error al cargar albergues: ${res.status}`);
  const body = await res.json();
  return body.data ?? body;
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

export async function updateShelterProfile(
  id: number,
  payload: { name?: string; description?: string; email?: string; phone?: string; address?: string }
): Promise<Shelter> {
  return apiFetch(`/admin/shelters/${id}/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateShelterLogo(id: number, file: File): Promise<Shelter> {
  const fd = new FormData();
  fd.append("logo", file);

  const res = await fetch(`${API_BASE_URL}/admin/shelters/${id}/logo`, {
    method: "POST",
    headers: { Accept: "application/json", ...authHeaders() },
    body: fd,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const firstValidationError = body?.errors ? Object.values(body.errors).flat()[0] : null;
    throw new Error(String(firstValidationError ?? body?.message ?? "No se pudo actualizar el logo."));
  }

  return res.json();
}

export async function toggleShelterActive(id: number): Promise<Shelter> {
  return apiFetch(`/shelters/${id}/toggle`, { method: "PATCH", body: "{}" });
}

export async function deleteShelter(id: number): Promise<void> {
  await apiFetch(`/shelters/${id}`, { method: "DELETE" });
}

export async function addShelterSponsor(
  shelterId: number,
  payload: { name: string; url?: string; logo: File }
): Promise<Shelter> {
  const fd = new FormData();
  fd.append("name", payload.name);
  if (payload.url) fd.append("url", payload.url);
  fd.append("logo", payload.logo);

  const res = await fetch(`${API_BASE_URL}/admin/shelters/${shelterId}/sponsors`, {
    method: "POST",
    headers: { Accept: "application/json", ...authHeaders() },
    body: fd,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstValidationError = body?.errors ? Object.values(body.errors).flat()[0] : null;
    throw new Error(String(firstValidationError ?? body?.message ?? "No se pudo agregar la insignia."));
  }
  return body;
}

export async function deleteShelterSponsor(shelterId: number, sponsorId: number): Promise<Shelter> {
  return apiFetch(`/admin/shelters/${shelterId}/sponsors/${sponsorId}`, { method: "DELETE" });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(extraHeaders: HeadersInit = {}): Promise<DashboardStats> {
  return apiFetch("/admin/dashboard/stats", { headers: extraHeaders });
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

export async function getCurrentUser(extraHeaders: HeadersInit = {}): Promise<{ user: AuthUser }> {
  return apiFetch("/auth/me", { headers: extraHeaders });
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

// ─── Donaciones (cuenta) ─────────────────────────────────────────────────────

export async function getMyDonations(): Promise<Donation[]> {
  const body = await apiFetch<{ data: Donation[] } | Donation[]>("/donations/mine?per_page=50");
  return Array.isArray(body) ? body : body.data;
}

// ─── Mascotas perdidas / encontradas ────────────────────────────────────────

export async function getLostFoundPosts(type?: LostFoundPostType): Promise<LostFoundPost[]> {
  const url = new URL(`${API_BASE_URL}/lost-found-posts`);
  if (type) url.searchParams.set("type", type);
  url.searchParams.set("per_page", "50");
  const res = await fetch(url.toString(), { cache: "no-store", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("No se pudieron cargar las publicaciones.");
  const body = await res.json();
  return body.data ?? body;
}

export async function getMyLostFoundPosts(): Promise<LostFoundPost[]> {
  const body = await apiFetch<{ data: LostFoundPost[] } | LostFoundPost[]>("/lost-found-posts/mine");
  return Array.isArray(body) ? body : body.data;
}

export async function createLostFoundPost(payload: CreateLostFoundPostPayload): Promise<LostFoundPost> {
  const fd = new FormData();
  fd.append("type", payload.type);
  fd.append("zone", payload.zone);
  fd.append("description", payload.description);
  fd.append("contact_phone", payload.contact_phone);
  if (payload.pet_name) fd.append("pet_name", payload.pet_name);
  if (payload.species) fd.append("species", payload.species);
  if (payload.photo) fd.append("photo", payload.photo);

  const res = await fetch(`${API_BASE_URL}/lost-found-posts`, {
    method: "POST",
    headers: { Accept: "application/json", ...authHeaders() },
    body: fd,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const firstValidationError = body?.errors ? Object.values(body.errors).flat()[0] : null;
    throw new Error(String(firstValidationError ?? body?.message ?? "No se pudo publicar."));
  }

  return res.json();
}

export async function deleteLostFoundPost(id: number): Promise<void> {
  await apiFetch(`/lost-found-posts/${id}`, { method: "DELETE" });
}

export async function getSuperAdminLostFoundPosts(
  type?: LostFoundPostType,
  status?: string
): Promise<LostFoundPost[]> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  params.set("per_page", "50");
  const body = await apiFetch<{ data: LostFoundPost[] }>(`/superadmin/lost-found-posts?${params}`);
  return body.data ?? [];
}

export async function updateSuperAdminLostFoundPostStatus(
  id: number,
  status: "approved" | "rejected"
): Promise<LostFoundPost> {
  return apiFetch(`/superadmin/lost-found-posts/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminAnimalsPage(
  params: { status?: string; per_page?: number; page?: number } = {},
  extraHeaders: HeadersInit = {}
): Promise<{ items: Animal[]; page: PageInfo }> {
  const url = new URL(`${API_BASE_URL}/admin/animals`);
  if (params.status) url.searchParams.set("status", params.status);
  url.searchParams.set("per_page", String(params.per_page ?? 24));
  if (params.page) url.searchParams.set("page", String(params.page));
  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json", ...authHeaders(), ...extraHeaders },
  });
  if (!res.ok) throw new Error(`Error al cargar animales: ${res.status}`);
  const body = await res.json();
  return { items: body.data ?? body, page: pageInfoFrom(body) };
}