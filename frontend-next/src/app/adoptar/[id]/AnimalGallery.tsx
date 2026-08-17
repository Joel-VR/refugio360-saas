'use client'

import { useState } from 'react'
import type { AnimalPhoto } from '@/types/animal'
import { mediaUrl } from '@/lib/media'

function PawIcon({ className = 'h-24 w-24' }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} fill='none' stroke='currentColor' strokeWidth='1.5'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
      />
    </svg>
  )
}

export default function AnimalGallery({ photos, animalName }: { photos: AnimalPhoto[]; animalName: string }) {
  const [active, setActive] = useState(0)

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-slate-custom-50 bg-cream-50'>
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(photos[active].photo_path)}
            alt={animalName}
            className='h-full w-full object-cover transition'
          />
        ) : (
          <PawIcon className='h-24 w-24 text-slate-300' />
        )}
      </div>

      {photos.length > 1 && (
        <div className='grid grid-cols-4 gap-3'>
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type='button'
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded-xl border-2 bg-cream-50 transition ${
                i === active ? 'border-brand-600' : 'border-slate-custom-50 opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${mediaUrl(photo.photo_path)}`} alt={animalName} className='h-full w-full object-cover' />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
