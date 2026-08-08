"use client";

import { useState } from "react";
import { friendlyErrorMessage, updateSuperAdminLostFoundPostStatus } from "@/lib/api";
import type { LostFoundPost } from "@/types/lostFoundPost";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

const STATUS_STYLES: Record<string, string> = {
  approved: "border-emerald-300/40 bg-emerald-400/10 text-emerald-200",
  rejected: "border-rose-300/40 bg-rose-400/10 text-rose-200",
  pending_review: "border-amber-300/40 bg-amber-400/10 text-amber-100",
};

function statusLabel(status: string) {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

export function LostFoundReviewList({
  initialPosts,
  emptyText,
  onStatusChange,
}: {
  initialPosts: LostFoundPost[];
  emptyText: string;
  onStatusChange?: (post: LostFoundPost) => void;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function changeStatus(id: number, status: "approved" | "rejected") {
    setBusyId(id);
    setError("");

    try {
      const updated = await updateSuperAdminLostFoundPostStatus(id, status);
      setPosts((current) => current.map((post) => (post.id === id ? updated : post)));
      onStatusChange?.(updated);
    } catch (err) {
      setError(friendlyErrorMessage(err, "No se pudo actualizar la publicación."));
    } finally {
      setBusyId(null);
    }
  }

  if (posts.length === 0) {
    return <p className="rounded-lg border border-white/10 bg-cream-50/5 p-5 text-sm text-slate-300">{emptyText}</p>;
  }

  return (
    <div className="grid gap-4">
      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      {posts.map((post) => {
        const pending = post.status === "pending_review";

        return (
          <article key={post.id} className="rounded-lg border border-white/10 bg-cream-50/5 p-5 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-800 text-2xl">
                  {post.photo_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${STORAGE}/${post.photo_path}`} alt={post.pet_name ?? "Mascota"} className="h-full w-full object-cover" />
                  ) : (
                    <span>🐾</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">{post.pet_name || "Sin nombre"}</h2>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[post.status]}`}>
                      {statusLabel(post.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">📍 {post.zone} · 📞 {post.contact_phone}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{post.description}</p>
                  <p className="mt-2 text-xs text-slate-500">Publicado por {post.user?.name ?? `usuario #${post.user_id}`}</p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={!pending || busyId === post.id}
                  onClick={() => changeStatus(post.id, "approved")}
                  className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-custom-900 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={!pending || busyId === post.id}
                  onClick={() => changeStatus(post.id, "rejected")}
                  className="rounded-md border border-rose-300/40 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
