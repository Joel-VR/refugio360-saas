const DEFAULT_STORAGE_URL = "http://localhost:8000/storage";
const STORAGE_URL = (process.env.NEXT_PUBLIC_STORAGE_URL ?? DEFAULT_STORAGE_URL).replace(/\/$/, "");

export function mediaUrl(path?: string | null): string {
  if (!path) return "";

  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  return `${STORAGE_URL}/${path.replace(/^\/+/, "")}`;
}
