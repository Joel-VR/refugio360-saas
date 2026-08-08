"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGate } from "@/lib/RoleGate";
import { ProfileMenu } from "@/components/ProfileMenu";

const NAV_LINKS = [
  { href: "/cuenta", label: "Mi cuenta", exact: true },
  { href: "/cuenta/adopciones", label: "Adopciones" },
  { href: "/cuenta/donaciones", label: "Donaciones" },
  { href: "/cuenta/mascotas-perdidas", label: "Mascotas perdidas" },
  { href: "/cuenta/mascotas-encontradas", label: "Mascotas encontradas" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RoleGate allow={["natural_person"]}>
      <div className="min-h-screen bg-cream-100 text-slate-custom-900">
        <nav className="border-b border-slate-custom-50 bg-cream-50 px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-sm">
              {NAV_LINKS.map((link) => {
                const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={active ? "font-bold text-brand-600" : "hover:text-brand-600"}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <ProfileMenu />
          </div>
        </nav>
        {children}
      </div>
    </RoleGate>
  );
}
