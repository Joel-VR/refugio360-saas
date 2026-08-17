import type { ReactNode } from "react";
import Image from "next/image";
import { RoleGate } from "@/lib/RoleGate";
import { ProfileMenu } from "@/components/ProfileMenu";
import { getServerAuthHeaders } from "@/lib/server-auth";
import { AdminDesktopNav, AdminMobileNav } from "./AdminNav";
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
  const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

  const NAV_LINKS = [
    { href: "/admin/dashboard",      label: "Dashboard",      icon: "📊" },
    { href: "/admin/animales",       label: "Animales",       icon: "🐾" },
    { href: "/admin/adopciones",     label: "Adopciones",     icon: "📋" },
    { href: "/admin/donaciones",     label: "Donaciones",     icon: "💰", badge: pendingCount },
    { href: "/admin/gastos",         label: "Gastos",         icon: "💸" },
    { href: "/admin/configuracion",  label: "Configuración",  icon: "⚙️" },
    { href: "/admin/documentacion",  label: "Guías",          icon: "📘" },
    { href: "/adoptar",              label: "Vista pública",  icon: "🌐", external: true },
  ];

  return (
    <RoleGate allow={["shelter_admin"]}>
      <ThemeProvider>
        <div className="admin-shell relative flex h-screen overflow-hidden text-slate-custom-900">
          <aside className="hidden w-60 flex-shrink-0 flex-col overflow-y-auto border-r border-slate-custom-50 bg-cream-50 px-4 py-8 md:flex">
            <div className="mb-8 flex items-center gap-3 px-2">
              {shelter?.name ? (
                <>
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600">
                    <span className="text-sm font-bold">{shelter.name.charAt(0).toUpperCase()}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-600">Refugio360</p>
                    <p className="truncate text-sm font-semibold text-slate-custom-900">{shelter.name}</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-600">Refugio360</p>
                  <p className="mt-1 text-lg font-semibold text-slate-custom-900">Admin Panel</p>
                </div>
              )}
            </div>
            <AdminDesktopNav links={NAV_LINKS} />
          </aside>

          <div className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-slate-custom-50 bg-cream-50 px-4 py-3 md:hidden">
            <p className="truncate text-sm font-semibold text-brand-600">{shelter?.name ?? "Refugio360 Admin"}</p>
            <div className="flex items-center gap-2">
              <AdminMobileNav links={NAV_LINKS} />
              <ProfileMenu variant="light" />
            </div>
          </div>

          <div className="absolute right-6 top-4 z-20 hidden md:block">
            <ProfileMenu variant="light" />
          </div>

          <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
        </div>
      </ThemeProvider>
    </RoleGate>
  );
}