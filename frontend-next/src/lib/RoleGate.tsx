"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type AppRole = "natural_person" | "shelter_admin" | "super_admin";

export function RoleGate({
  allow,
  children,
}: {
  allow: AppRole[];
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<boolean | null>(null);
  const [shelterStatus, setShelterStatus] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const rawUser = window.localStorage.getItem("auth_user");
      const user = rawUser
        ? JSON.parse(rawUser) as { status?: boolean; shelter?: { approval_status?: string } | null }
        : null;

      setRole(window.localStorage.getItem("user_role"));
      setToken(window.localStorage.getItem("auth_token"));
      setUserStatus(user?.status ?? null);
      setShelterStatus(user?.shelter?.approval_status ?? null);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  if (token && role === "shelter_admin" && (!userStatus || shelterStatus !== "approved")) {
    return <ShelterApprovalState status={shelterStatus} />;
  }

  if (!token || !role || !allow.includes(role as AppRole)) {
    return (
      <main className="min-h-screen bg-[#f7f8f3] px-6 py-16 text-slate-950">
        <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Acceso protegido</p>
          <h1 className="mt-3 text-3xl font-semibold">Inicia sesión con el rol correcto</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Esta sección está reservada para: {allow.join(", ")}.
          </p>
          <Link href="/login" className="mt-6 inline-block rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
            Ir a iniciar sesión
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

function ShelterApprovalState({ status }: { status: string | null }) {
  const rejected = status === "rejected";

  return (
    <main className="min-h-screen bg-[#f7f8f3] px-6 py-16 text-slate-950">
      <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8">
        <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${rejected ? "text-rose-700" : "text-amber-700"}`}>
          {rejected ? "Solicitud rechazada" : "Solicitud en revisión"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {rejected ? "Se rechazó tu solicitud" : "Espera a que acepten tu solicitud"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {rejected
            ? "Tu registro de albergue fue revisado y rechazado. Más adelante recibirás más información por correo."
            : "Cuando el super admin apruebe tu albergue podrás disfrutar de todas las herramientas del panel."}
        </p>
        <Link href="/perfil" className="mt-6 inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Ver perfil
        </Link>
      </section>
    </main>
  );
}
