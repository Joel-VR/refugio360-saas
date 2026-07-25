"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicShell } from "@/lib/SimpleViews";
import { login, storeSession } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const next = useSearchParams().get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function defaultPathForRole(role: string) {
    const storedUser = window.localStorage.getItem("auth_user");
    const user = storedUser ? JSON.parse(storedUser) as { status?: boolean; shelter?: { approval_status?: string } | null } : null;
    if (role === "shelter_admin" && (!user?.status || user?.shelter?.approval_status !== "approved")) {
      return "/espera-aprobacion";
    }
    if (role === "shelter_admin") return "/admin/dashboard";
    if (role === "super_admin") return "/superadmin/dashboard";
    return "/cuenta";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await login({ email, password });
      storeSession(session);
      const requiresApprovalScreen =
        session.user.role === "shelter_admin" &&
        (!session.user.status || session.user.shelter?.approval_status !== "approved");
      window.location.href = requiresApprovalScreen || next === "/" ? defaultPathForRole(session.user.role) : next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-md gap-5 px-6 py-12">
        <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
        <p className="text-sm text-slate-600">Ingresa con tu correo y contraseña. El sistema abrirá el panel según tu rol.</p>

        <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Correo
            <input
              required
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
              autoComplete="email"
              inputMode="email"
              placeholder="correo@ejemplo.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Contraseña
            <span className="relative">
              <input
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 pr-11 font-normal"
                autoComplete="current-password"
                placeholder="Tu contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                className="absolute inset-y-0 right-2 my-auto grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
                onClick={() => setShowPassword((value) => !value)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </span>
          </label>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button disabled={loading} className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </PublicShell>
  );
}
