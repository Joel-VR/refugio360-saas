"use client";

import { useEffect, useState } from "react";
import { SiteHeader, type NavLink } from "@/components/SiteHeader";
import { getStoredUser } from "@/lib/api";

const GUEST_NAV_LINKS: NavLink[] = [
  { href: "/refugios", label: "Refugios" },
  { href: "/mascotas/perdidas", label: "Mascotas perdidas" },
  { href: "/mascotas/encontradas", label: "Mascotas encontradas" },
];

const NATURAL_PERSON_NAV_LINKS: NavLink[] = [
  { href: "/cuenta", label: "Mi cuenta", exact: true },
  { href: "/refugios", label: "Refugios" },
  { href: "/cuenta/adopciones", label: "Adopciones" },
  { href: "/cuenta/donaciones", label: "Donaciones" },
  { href: "/cuenta/mascotas-perdidas", label: "Mascotas perdidas" },
  { href: "/cuenta/mascotas-encontradas", label: "Mascotas encontradas" },
];

function useNavLinksByRole(): NavLink[] {
  const [links, setLinks] = useState<NavLink[]>(GUEST_NAV_LINKS);

  useEffect(() => {
    function sync() {
      const user = getStoredUser();
      if (user?.role === "natural_person") {
        setLinks(NATURAL_PERSON_NAV_LINKS);
      } else {
        // sin sesión, shelter_admin o super_admin ven la navegación pública normal
        setLinks(GUEST_NAV_LINKS);
      }
    }

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth-user-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-user-updated", sync);
    };
  }, []);

  return links;
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const navLinks = useNavLinksByRole();

  return (
    <main className="min-h-screen bg-cream-100 text-slate-custom-900">
      <SiteHeader navLinks={navLinks} />
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