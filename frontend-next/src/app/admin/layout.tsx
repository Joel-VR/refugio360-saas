import Link from "next/link";
import type { ReactNode } from "react";
import { RoleGate } from "@/lib/RoleGate";
import { ProfileMenu } from "@/components/ProfileMenu";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

async function getPendingDonationsCount() {
  try {
    const res = await fetch(`${API}/donations?status=pending&per_page=1`, { cache: "no-store" });
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
    { href: "/admin/albergues",  label: "Albergues",    icon: "🏠" },
    { href: "/admin/adopciones", label: "Adopciones",   icon: "📋" },
    { href: "/admin/donaciones", label: "Donaciones",   icon: "💰", badge: pendingCount },
    { href: "/admin/transparencia", label: "Transparencia", icon: "📈" },
    { href: "/admin/configuracion", label: "Configuración", icon: "⚙️" },
    { href: "/admin/documentacion", label: "Guías",      icon: "📘" },
    { href: "/adoptar",          label: "Vista pública",icon: "🌐" },
  ];

  return (
    <RoleGate allow={["shelter_admin"]}>
    <div className="relative min-h-screen flex bg-[#020617] text-slate-100">
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur py-8 px-4">
        <div className="mb-8 px-2">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Refugio360</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-cream-50/10 hover:text-slate-100"
            >
              <span className="flex items-center gap-3">
                <span>{l.icon}</span>
                {l.label}
              </span>
              {!!l.badge && (
                <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {l.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/90 backdrop-blur px-4 py-3">
        <p className="text-sm font-semibold text-cyan-300">Refugio360 Admin</p>
        <div className="flex items-center gap-2">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="relative text-xl" title={l.label}>
              {l.icon}
              {!!l.badge && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                  {l.badge}
                </span>
              )}
            </Link>
          ))}
          <ProfileMenu variant="dark" />
        </div>
      </div>

      <div className="absolute right-6 top-4 z-20 hidden md:block">
        <ProfileMenu variant="dark" />
      </div>

      <main className="flex-1 md:pt-0 pt-14">{children}</main>
    </div>
    </RoleGate>
  );
}
