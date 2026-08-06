"use client";

import Link from "next/link";
import { RoleGate } from "@/lib/RoleGate";
import { ProfileMenu } from "@/components/ProfileMenu";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["super_admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <nav className="border-b border-white/10 px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/superadmin/dashboard" className="font-bold text-cyan-300">Super Admin</Link>
              <Link href="/superadmin/albergues">Albergues</Link>
              <Link href="/superadmin/albergues/pendientes">Pendientes</Link>
              <Link href="/superadmin/publicaciones/perdidas">Perdidas</Link>
              <Link href="/superadmin/publicaciones/encontradas">Encontradas</Link>
              <Link href="/superadmin/usuarios">Usuarios</Link>
            </div>
            <ProfileMenu variant="dark" />
          </div>
        </nav>
        {children}
      </div>
    </RoleGate>
  );
}
