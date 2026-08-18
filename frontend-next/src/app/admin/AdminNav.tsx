"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; icon?: React.ReactNode; badge?: number; external?: boolean };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminDesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5">
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        const className = `group flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-brand-600/10 font-semibold text-brand-600 shadow-sm shadow-brand-600/5"
            : "text-slate-custom-700 hover:bg-slate-custom-50 hover:text-slate-custom-900"
        }`;

        const content = (
          <>
            <span className="flex items-center gap-3">
              {l.icon && (
                <span className={`transition-transform duration-200 group-hover:scale-105 ${active ? "text-brand-600" : "text-slate-custom-700"}`}>
                  {l.icon}
                </span>
              )}
              {l.label}
            </span>
            {!!l.badge && (
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                {l.badge}
              </span>
            )}
          </>
        );

        if (l.external) {
          return (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={className}>
              {content}
            </a>
          );
        }

        return (
          <Link key={l.href} href={l.href} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Botón de menú hamburguesa */}
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

      {/* Menú desplegable vertical en móvil */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-slate-100 bg-white px-6 py-4 shadow-lg">
          <nav className="flex flex-col gap-2 text-sm font-medium">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              const className = `flex items-center justify-between rounded-md px-3 py-2.5 transition-colors ${
                active
                  ? "bg-brand-50 font-semibold text-brand-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-brand-600"
              }`;

              const content = (
                <>
                  <span className="flex items-center gap-3">
                    {l.icon && (
                      <span className={active ? "text-brand-600" : "text-slate-500"}>{l.icon}</span>
                    )}
                    {l.label}
                  </span>
                  {!!l.badge && (
                    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {l.badge}
                    </span>
                  )}
                </>
              );

              if (l.external) {
                return (
                  <a 
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className={className}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={className}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}