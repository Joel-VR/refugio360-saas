"use client";

import { useEffect, useState } from "react";
import { getSuperAdminUsers, type SuperAdminUser } from "@/lib/api";
import { StatusBadge } from "@/components/superadmin/ShelterReviewList";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getSuperAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar usuarios."));
  }, []);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Super Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Usuarios</h1>
      </div>

      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Cuenta</th>
              <th className="px-4 py-3">Albergue</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-slate-400">{user.email}</p>
                </td>
                <td className="px-4 py-4 text-slate-200">{roleLabel(user.role)}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${user.status ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200" : "border-amber-300/40 bg-amber-400/10 text-amber-100"}`}>
                    {user.status ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-300">{user.shelter?.name ?? "No aplica"}</td>
                <td className="px-4 py-4">{user.shelter ? <StatusBadge status={user.shelter.approval_status} /> : <span className="text-slate-500">-</span>}</td>
                <td className="px-4 py-4 text-slate-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-5 text-sm text-slate-300">No hay usuarios registrados.</p>}
      </div>
    </section>
  );
}

function roleLabel(role: string) {
  if (role === "natural_person") return "Persona natural";
  if (role === "shelter_admin") return "Albergue";
  if (role === "super_admin") return "Super admin";
  return role;
}
