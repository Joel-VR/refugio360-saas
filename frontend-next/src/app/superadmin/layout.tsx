"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGate } from "@/lib/RoleGate";
import { ProfileMenu } from "@/components/ProfileMenu";

const NAV_LINKS = [
  { href: "/superadmin/dashboard", label: "Super Admin", exact: true },
  { href: "/superadmin/albergues", label: "Albergues", exact: true },
  { href: "/superadmin/albergues/pendientes", label: "Pendientes" },
  { href: "/superadmin/publicaciones/perdidas", label: "Perdidas" },
  { href: "/superadmin/publicaciones/encontradas", label: "Encontradas" },
  { href: "/superadmin/usuarios", label: "Usuarios" },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RoleGate allow={["super_admin"]}>
      <div className="min-h-screen bg-cream-100 text-slate-custom-900">
        <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
              {NAV_LINKS.map((link) => {
                const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-1 transition-colors duration-200 ${
                      active
                        ? "font-semibold text-brand-600 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-600"
                        : "text-slate-600 hover:text-brand-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-md border border-slate-custom-50 px-3 py-2 text-sm font-medium text-slate-custom-700 transition hover:border-brand-600/30 hover:text-brand-600"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Volver al inicio
              </Link>
              <ProfileMenu variant="light"/>
            </div>
         
          </div>
        </nav>
        {children}
      </div>
    </RoleGate>
  );
}