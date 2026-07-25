"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, getStoredToken, getStoredUser, storeAuthUser, type AuthUser } from "@/lib/api";
import { PublicShell } from "@/lib/SimpleViews";

export default function ApprovalWaitingPage() {
  const [user, setUser] = useState<AuthUser | null>(() => (getStoredToken() ? getStoredUser() : null));

  useEffect(() => {
    if (!getStoredToken()) {
      window.location.href = "/login?next=/espera-aprobacion";
      return;
    }

    getCurrentUser().then(({ user }) => {
      storeAuthUser(user);
      setUser(user);

      if (user.role === "shelter_admin" && user.status && user.shelter?.approval_status === "approved") {
        window.location.href = "/admin/dashboard";
      }
    });
  }, []);

  const rejected = user?.shelter?.approval_status === "rejected";

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-2xl gap-5 px-6 py-16">
        <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${rejected ? "text-rose-700" : "text-amber-700"}`}>
          {rejected ? "Solicitud rechazada" : "Solicitud en revisión"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {rejected ? "Se rechazó tu solicitud" : "Espera a que te acepten la solicitud"}
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          {rejected
            ? "Tu solicitud de albergue fue rechazada. Más adelante se enviará información a tu correo."
            : "Tu cuenta de albergue ya fue registrada, pero aún no está activa. Cuando el super admin la apruebe podrás disfrutar de todas las herramientas."}
        </p>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-700">
          <p className="font-semibold">{user?.shelter?.name ?? "Albergue en revisión"}</p>
          <p className="mt-1">{user?.email}</p>
        </div>
        <Link href="/perfil" className="w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Ver perfil
        </Link>
      </section>
    </PublicShell>
  );
}
