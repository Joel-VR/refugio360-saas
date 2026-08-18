"use client";

import { useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RoleGate allow={["super_admin"]}>
      <div className="min-h-screen bg-cream-100 text-slate-custom-900">
        <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            
            {/* Enlaces de navegación para pantallas grandes (Desktop) */}
            <div className="hidden md:flex flex-wrap items-center gap-6 text-sm font-medium">
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

            {/* Botón de menú hamburguesa para móviles */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none"
                aria-label="Abrir menú de navegación"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Acciones de la derecha (Volver al inicio y Menú de perfil) */}
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
            </div>
          </div>

          {/* Menú desplegable móvil */}
          {mobileMenuOpen && (
            <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden shadow-lg">
              <div className="flex flex-col gap-3 text-sm font-medium">
                {NAV_LINKS.map((link) => {
                  const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-md px-3 py-2 transition-colors ${
                        active
                          ? "bg-brand-50 font-semibold text-brand-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-brand-600"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="my-2 border-t border-slate-100 pt-2 sm:hidden">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Volver al inicio
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
        {children}
      </div>
    </RoleGate>
  );
}