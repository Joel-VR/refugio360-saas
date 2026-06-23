import Link from "next/link";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/admin/dashboard",  label: "Dashboard",    icon: "📊" },
  { href: "/admin/animales",   label: "Animales",     icon: "🐾" },
  { href: "/admin/albergues",  label: "Albergues",    icon: "🏠" },
  { href: "/admin/adopciones", label: "Adopciones",   icon: "📋" },
  { href: "/adoptar",          label: "Vista pública",icon: "🌐" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100">
      {/* Sidebar */}
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
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-slate-100"
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/90 backdrop-blur px-4 py-3">
        <p className="text-sm font-semibold text-cyan-300">Refugio360 Admin</p>
        <div className="flex gap-2">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-xl" title={l.label}>
              {l.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-14">{children}</main>
    </div>
  );
}
