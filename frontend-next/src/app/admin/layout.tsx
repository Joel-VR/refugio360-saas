import type { ReactNode } from "react";
import Link from "next/link";
import { headers as nextHeaders } from "next/headers";
import { RoleGate } from "@/lib/RoleGate";
import { ProfileMenu } from "@/components/ProfileMenu";
import { AdminMobileNav } from "./AdminNav";
import { getServerAuthHeaders } from "@/lib/server-auth";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { getCurrentUser, API_BASE_URL as API } from "@/lib/api";

async function getPendingDonationsCount(headers: HeadersInit) {
  try {
    const res = await fetch(`${API}/admin/donations?status=pending&per_page=1`, {
      cache: "no-store",
      headers: { Accept: "application/json", ...headers },
    });
    if (!res.ok) return 0;
    const body = await res.json();
    return body.total ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headers = await getServerAuthHeaders();
  const [pendingCount, currentUser] = await Promise.all([
    getPendingDonationsCount(headers),
    getCurrentUser(headers).catch(() => null),
  ]);

  const shelter = currentUser?.user?.shelter;

  const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/animales", label: "Animales" },
  { href: "/admin/adopciones", label: "Adopciones" },
  { href: "/admin/donaciones", label: "Donaciones", badge: pendingCount },
  { href: "/admin/gastos", label: "Gastos" },
  { href: "/admin/documentacion", label: "Guías" },

];

  return (
    <ThemeProvider>
      <RoleGate allow={["shelter_admin"]}>
        <div className="min-h-screen bg-cream-100 text-slate-custom-900">
          {/* Barra de navegación superior fija idéntica a la de Super Admin */}
          <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md relative">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

              {/* Logo / Nombre del albergue a la izquierda */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                  {shelter?.name ?? "Refugio360"}
                </span>
              </div>

              {/* Enlaces de navegación horizontales para Desktop */}
              <nav className="hidden md:flex flex-wrap items-center gap-6 text-sm font-medium">
                {NAV_LINKS.map((link) => {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="relative py-1 text-slate-600 hover:text-brand-600 transition-colors duration-200"
                    >
                      {link.label}
                      {link.badge ? (
                        <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                          {link.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              {/* Acciones de la derecha (Volver al inicio + Menú de Perfil + Hamburguesa móvil) */}
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="hidden sm:flex items-center gap-2 rounded-md border border-slate-custom-50 px-3 py-2 text-sm font-medium text-slate-custom-700 transition hover:border-brand-600/30 hover:text-brand-600"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Volver al inicio
                </Link>
                <ProfileMenu variant="light" />

                {/* Hamburguesa solo en móvil */}
                <AdminMobileNav links={NAV_LINKS} />
              </div>
            </div>
          </header>

          {/* Contenido Principal */}
          <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
        </div>
      </RoleGate>
    </ThemeProvider>
  );
}