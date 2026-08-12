import type { ReactNode } from "react";
import { RoleGate } from "@/lib/RoleGate";
import { ProfileMenu } from "@/components/ProfileMenu";
import { getServerAuthHeaders } from "@/lib/server-auth";
import { AdminDesktopNav, AdminMobileNav } from "./AdminNav";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { API_BASE_URL as API } from "@/lib/api";

async function getPendingDonationsCount() {
  try {
    const res = await fetch(`${API}/donations?status=pending&per_page=1`, {
      cache: "no-store",
      headers: { Accept: "application/json", ...(await getServerAuthHeaders()) },
    });
    if (!res.ok) return 0;
    const body = await res.json();
    return body.total ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const pendingCount = await getPendingDonationsCount();

  const NAV_LINKS = [
    { href: "/admin/dashboard",  label: "Dashboard",    icon: "📊" },
    { href: "/admin/animales",   label: "Animales",     icon: "🐾" },
    { href: "/admin/adopciones", label: "Adopciones",   icon: "📋" },
    { href: "/admin/donaciones", label: "Donaciones",   icon: "💰", badge: pendingCount },
    { href: "/admin/gastos",     label: "Gastos",       icon: "💸" },
    { href: "/admin/documentacion", label: "Guías",      icon: "📘" },
    { href: "/adoptar",          label: "Vista pública", icon: "🌐", external: true },
  ];

  return (
    <RoleGate allow={["shelter_admin"]}>
      <ThemeProvider>
        <div className="admin-shell relative h-screen flex overflow-hidden text-slate-custom-900">
          <aside className="hidden md:flex w-60 flex-shrink-0 flex-col border-r border-slate-custom-50 bg-cream-50 py-8 px-4 overflow-y-auto">
            <div className="mb-8 px-2">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-600">Refugio360</p>
              <p className="mt-1 text-lg font-semibold text-slate-custom-900">Admin Panel</p>
            </div>
            <AdminDesktopNav links={NAV_LINKS} />
          </aside>

          <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-slate-custom-50 bg-cream-50 px-4 py-3">
            <p className="text-sm font-semibold text-brand-600">Refugio360 Admin</p>
            <div className="flex items-center gap-2">
              <AdminMobileNav links={NAV_LINKS} />
              <ProfileMenu variant="light" />
            </div>
          </div>

          <div className="absolute right-6 top-4 z-20 hidden md:block">
            <ProfileMenu variant="light" />
          </div>

          <main className="flex-1 overflow-y-auto md:pt-0 pt-14">{children}</main>
        </div>
      </ThemeProvider>
    </RoleGate>
  );
}
