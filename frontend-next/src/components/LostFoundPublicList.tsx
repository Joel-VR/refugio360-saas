"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { friendlyErrorMessage, getLostFoundPosts, getStoredToken } from "@/lib/api";
import type { LostFoundPost, LostFoundPostType } from "@/types/lostFoundPost";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

export function LostFoundPublicList({
  type,
  publishHref,
}: {
  type: LostFoundPostType;
  publishHref: string;
}) {
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isLoggedIn = Boolean(getStoredToken());

  useEffect(() => {
    getLostFoundPosts(type)
      .then(setPosts)
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudieron cargar las publicaciones.")))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="grid gap-6">
      <Link
        href={isLoggedIn ? publishHref : `/login?next=${encodeURIComponent(publishHref)}`}
        className="w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
      >
        {type === "perdida" ? "Publicar mascota perdida" : "Reportar mascota encontrada"}
      </Link>

      {loading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg border border-slate-custom-50 bg-cream-50" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-custom-50 bg-cream-50 p-8 text-center text-sm text-slate-custom-700">
          Todavía no hay publicaciones aprobadas de este tipo.
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col overflow-hidden rounded-lg border border-slate-custom-50 bg-cream-50 shadow-sm">
              <div className="flex h-40 items-center justify-center bg-slate-100 text-5xl">
                {post.photo_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${STORAGE}/${post.photo_path}`} alt={post.pet_name ?? "Mascota"} className="h-full w-full object-cover" />
                ) : (
                  <span>🐾</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="text-lg font-semibold">{post.pet_name || (post.species ? `Mascota (${post.species})` : "Mascota")}</h2>
                <p className="text-sm text-slate-custom-700">📍 {post.zone}</p>
                <p className="text-sm leading-6 text-slate-custom-700 line-clamp-3">{post.description}</p>
                <p className="mt-auto text-sm font-semibold text-brand-600">📞 {post.contact_phone}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
