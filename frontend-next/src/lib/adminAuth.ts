export function adminHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    credentials: "include",
    ...init,
    headers: adminHeaders(init.headers),
  });
}
