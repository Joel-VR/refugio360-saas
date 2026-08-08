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
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <nav className="border-b border-white/10 px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-sm">
              {NAV_LINKS.map((link) => {
                const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={active ? "font-bold text-cyan-300" : "text-slate-300 hover:text-cyan-200"}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <ProfileMenu variant="dark" />
          </div>
        </nav>
        {children}
      </div>
    </RoleGate>
  );
}
