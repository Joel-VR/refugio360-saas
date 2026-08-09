"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AuthNav } from "@/components/ProfileMenu";

const NAV_LINKS = [
  { href: "/refugios", label: "Refugios" },
  { href: "/mascotas/perdidas", label: "Mascotas perdidas" },
  { href: "/mascotas/encontradas", label: "Mascotas encontradas" },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-cream-100 text-slate-custom-900">
      <nav className="border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-brand-600 hover:opacity-90 transition-opacity">
  <Image
    src="/logo.png"
    alt="Refugio360 Logo"
    width={48}
    height={48}
    priority
  />
  <span className="flex items-baseline">
    <span className="text-2xl font-extrabold tracking-normal">Refugio</span>
    <span className="text-lg font-bold opacity-90">360</span>
  </span>
</Link>

<div className="hidden items-center gap-8 text-base font-medium md:flex">
  {NAV_LINKS.map((link) => {
    const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
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
  
  <div className="h-6 w-[1px] bg-slate-200" />

  <AuthNav />
</div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden focus:outline-none"
            aria-label="Abrir menú"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-6 md:hidden bg-white">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-base py-1 ${
                    active ? "font-semibold text-brand-600" : "text-slate-700 hover:text-brand-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-slate-100">
              <AuthNav />
            </div>
          </div>
        )}
      </nav>

      {children}
    </main>
  );
}

export function SimplePage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-12">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">{eyebrow}</p>}
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-6 text-slate-custom-700">{description}</p>}
        {children}
      </section>
    </PublicShell>
  );
}

export function PlaceholderList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="rounded-lg border border-slate-custom-50 bg-cream-50 p-4 text-sm text-slate-custom-700">
          {item}
        </div>
      ))}
    </div>
  );
}