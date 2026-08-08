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
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Publicaciones</p>
        <h1 className="mt-2 text-3xl font-semibold">Mascotas encontradas</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Aprueba o rechaza reportes de mascotas encontradas antes de que aparezcan públicamente.
        </p>
      </div>

      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      {loading ? (
        <p className="rounded-lg border border-white/10 bg-cream-50/5 p-5 text-sm text-slate-300">Cargando publicaciones...</p>
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
