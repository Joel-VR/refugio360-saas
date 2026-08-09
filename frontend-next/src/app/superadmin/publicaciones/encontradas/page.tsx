"use client";

import { useEffect, useState } from "react";
import { getSuperAdminLostFoundPosts, friendlyErrorMessage } from "@/lib/api";
import { LostFoundReviewList } from "@/components/superadmin/LostFoundReviewList";
import type { LostFoundPost } from "@/types/lostFoundPost";

export default function SuperAdminFoundPostsPage() {
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSuperAdminLostFoundPosts("encontrada")
      .then(setPosts)
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudieron cargar las publicaciones.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Publicaciones</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-custom-900">Mascotas encontradas</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-custom-700">
          Aprueba o rechaza reportes de mascotas encontradas antes de que aparezcan públicamente.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 text-sm text-slate-custom-700">
          Cargando publicaciones...
        </p>
      ) : (
        <LostFoundReviewList
          initialPosts={posts}
          emptyText="No hay publicaciones de mascotas encontradas."
          onStatusChange={(updated) => {
            if (updated.status !== "pending_review") {
              setPosts((current) => current.map((p) => (p.id === updated.id ? updated : p)));
            }
          }}
        />
      )}
    </section>
  );
}