"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleShelterActive, deleteShelter } from "@/lib/api";
import type { Shelter } from "@/types/shelter";

export default function ShelterActions({ shelter }: { shelter: Shelter }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await toggleShelterActive(shelter.id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      await deleteShelter(shelter.id);
      router.refresh();
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/albergues/${shelter.id}/editar`}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
      >
        Editar
      </Link>

      <button
        onClick={handleToggle}
        disabled={loading}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
      >
        {shelter.is_active ? "Desactivar" : "Activar"}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        className={`rounded-lg border px-3 py-1.5 text-xs transition disabled:opacity-50 ${
          confirmDelete
            ? "border-rose-400/50 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20"
            : "border-white/10 text-slate-400 hover:border-rose-400/30 hover:text-rose-300"
        }`}
      >
        {confirmDelete ? "¿Confirmar?" : "Eliminar"}
      </button>
    </div>
  );
}
