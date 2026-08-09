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
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Super admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-custom-900">Usuarios</h1>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-custom-50 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-custom-50 bg-cream-50 text-xs uppercase tracking-[0.16em] text-slate-custom-700">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Cuenta</th>
              <th className="px-4 py-3">Albergue</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-custom-50">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-custom-900">{user.name}</p>
                  <p className="text-slate-custom-700">{user.email}</p>
                </td>
                <td className="px-4 py-4 text-slate-custom-700">{roleLabel(user.role)}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      user.status
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {user.status ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-custom-700">{user.shelter?.name ?? "No aplica"}</td>
                <td className="px-4 py-4">
                  {user.shelter ? <StatusBadge status={user.shelter.approval_status} /> : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-4 py-4 text-slate-custom-700">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-5 text-sm text-slate-custom-700">No hay usuarios registrados.</p>}
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