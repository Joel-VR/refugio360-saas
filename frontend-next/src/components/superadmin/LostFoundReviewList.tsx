'use client'

import { useState } from 'react'
import { friendlyErrorMessage, updateSuperAdminLostFoundPostStatus } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { LostFoundPost } from '@/types/lostFoundPost'

const STATUS_STYLES: Record<string, string> = {
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  pending_review: 'border-amber-200 bg-amber-50 text-amber-700',
}

function statusLabel(status: string) {
  if (status === 'approved') return 'Aprobado'
  if (status === 'rejected') return 'Rechazado'
  return 'Pendiente'
}

export function LostFoundReviewList({
  initialPosts,
  emptyText,
  onStatusChange,
}: {
  initialPosts: LostFoundPost[]
  emptyText: string
  onStatusChange?: (post: LostFoundPost) => void
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function changeStatus(id: number, status: 'approved' | 'rejected') {
    setBusyId(id)
    setError('')

    try {
      const updated = await updateSuperAdminLostFoundPostStatus(id, status)
      setPosts(current => current.map(post => (post.id === id ? updated : post)))
      onStatusChange?.(updated)
    } catch (err) {
      setError(friendlyErrorMessage(err, 'No se pudo actualizar la publicación.'))
    } finally {
      setBusyId(null)
    }
  }

  if (posts.length === 0) {
    return (
      <p className='rounded-lg border border-slate-custom-50 bg-cream-50 p-5 text-sm text-slate-custom-700'>
        {emptyText}
      </p>
    )
  }

  return (
    <div className='grid gap-4'>
      {error && <p className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>}
      {posts.map(post => {
        const pending = post.status === 'pending_review'

        return (
          <article key={post.id} className='rounded-lg border border-slate-custom-50 bg-white p-5 shadow-sm'>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
              <div className='flex min-w-0 gap-4'>
                <div className='flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-100 text-2xl'>
                  {post.photo_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${mediaUrl(post.photo_path)}`}
                      alt={post.pet_name ?? 'Mascota'}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <span>ðŸ¾</span>
                  )}
                </div>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <h2 className='text-lg font-semibold text-slate-custom-900'>{post.pet_name || 'Sin nombre'}</h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[post.status]}`}
                    >
                      {statusLabel(post.status)}
                    </span>
                  </div>
                  <p className='mt-1 text-sm text-slate-custom-700'>
                    ðŸ“ {post.zone} · ðŸ“ž {post.contact_phone}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-custom-700'>{post.description}</p>
                  <p className='mt-2 text-xs text-slate-400'>
                    Publicado por {post.user?.name ?? `usuario #${post.user_id}`}
                  </p>
                </div>
              </div>

              <div className='flex shrink-0 gap-2'>
                <button
                  type='button'
                  disabled={!pending || busyId === post.id}
                  onClick={() => changeStatus(post.id, 'approved')}
                  className='rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45'
                >
                  Aprobar
                </button>
                <button
                  type='button'
                  disabled={!pending || busyId === post.id}
                  onClick={() => changeStatus(post.id, 'rejected')}
                  className='rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45'
                >
                  Rechazar
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
