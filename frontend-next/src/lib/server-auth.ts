import { cookies } from "next/headers";

export async function getServerAuthHeaders(): Promise<HeadersInit> {
  const store = await cookies();
  const token = store.get("auth_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
