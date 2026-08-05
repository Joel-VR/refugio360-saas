"use client";

import Link from "next/link";
import { RoleGate } from "@/lib/RoleGate";
import { ProfileMenu } from "@/components/ProfileMenu";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["natural_person"]}>
      <div className="min-h-screen bg-cream-100 text-slate-custom-900">
        <nav className="border-b border-slate-custom-50 bg-cream-50 px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/cuenta" className="font-bold text-brand-600">Mi cuenta</Link>
              <Link href="/cuenta/adopciones">Adopciones</Link>
              <Link href="/cuenta/donaciones">Donaciones</Link>
              <Link href="/cuenta/mascotas-perdidas">Perdidas</Link>
              <Link href="/cuenta/mascotas-encontradas">Encontradas</Link>
            </div>
            <ProfileMenu />
          </div>
        </nav>
        {children}
      </div>
    </RoleGate>
  );
}
