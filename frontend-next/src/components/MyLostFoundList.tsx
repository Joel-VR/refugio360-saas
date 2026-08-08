"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteLostFoundPost, friendlyErrorMessage, getMyLostFoundPosts } from "@/lib/api";
import type { LostFoundPost, LostFoundPostType } from "@/types/lostFoundPost";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending_review: { label: "Pendiente", className: "border-amber-300 bg-amber-50 text-amber-700" },
  approved: { label: "Aprobado", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rechazado", className: "border-rose-300 bg-rose-50 text-rose-700" },
};

export function MyLostFoundList({ type, newHref }: { type: LostFoundPostType; newHref: string }) {
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    getMyLostFoundPosts()
      .then((all) => setPosts(all.filter((p) => p.type === type)))
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudieron cargar tus publicaciones.")))
      .finally(() => setLoading(false));
  }, [type]);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta publicación?")) return;
    setBusyId(id);
    try {
      await deleteLostFoundPost(id);
      setPosts((current) => current.filter((p) => p.id !== id));
    } catch (err) {
      setError(friendlyErrorMessage(err, "No se pudo eliminar la publicación."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <Link href={newHref} className="w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
        {type === "perdida" ? "Nueva publicación" : "Nuevo reporte"}
      </Link>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading && (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-slate-custom-50 bg-cream-50" />
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-custom-50 bg-cream-50 p-6 text-center text-sm text-slate-custom-700">
          Todavía no tienes publicaciones de este tipo.
        </p>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid gap-3">
          {posts.map((post) => {
            const status = STATUS_LABEL[post.status] ?? { label: post.status, className: "border-slate-300 bg-slate-100 text-slate-600" };
            return (
              <article key={post.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-custom-50 bg-cream-50 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{post.pet_name || post.zone}</p>
                  <p className="truncate text-sm text-slate-custom-700">📍 {post.zone} — {post.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                  <button
                    type="button"
                    disabled={busyId === post.id}
                    onClick={() => handleDelete(post.id)}
                    className="text-sm font-semibold text-rose-600 hover:underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
