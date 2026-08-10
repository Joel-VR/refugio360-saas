"use client";

import { RoleGate } from "@/lib/RoleGate";
import { SiteHeader, type NavLink } from "@/components/SiteHeader";

const ACCOUNT_NAV_LINKS: NavLink[] = [
  { href: "/cuenta", label: "Mi cuenta", exact: true },
  { href: "/refugios", label: "Refugios" },
  { href: "/cuenta/adopciones", label: "Adopciones" },
  { href: "/cuenta/donaciones", label: "Donaciones" },
  { href: "/cuenta/mascotas-perdidas", label: "Mascotas perdidas" },
  { href: "/cuenta/mascotas-encontradas", label: "Mascotas encontradas" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["natural_person"]}>
      <div className="min-h-screen bg-cream-100 text-slate-custom-900">
        <SiteHeader navLinks={ACCOUNT_NAV_LINKS} />
        {children}
      </div>
    </RoleGate>
  );
}