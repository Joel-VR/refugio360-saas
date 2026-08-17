'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { authHeaders, friendlyErrorMessage, API_BASE_URL as API } from '@/lib/api'
import { mediaUrl } from '@/lib/media'

const MAX_SIZE = 5 * 1024 * 1024

type Method = 'yape' | 'plin'
type DonationType = 'general' | 'specific'
type Step = 1 | 2 | 3 | 4

type Shelter = {
  id: number
  name: string
  slug: string
  description: string | null
  logo_path: string | null
  accepts_donations: boolean
  payment_methods: Record<
    Method,
    { enabled: boolean; phone: string | null; owner: string | null; qr_path: string | null }
  >
}

type Animal = {
  id: number
  name: string
  species: string
  photos?: { photo_path: string }[]
}

function bytes(size: number) {
  return size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function DonationFlow({ shelter }: { shelter: Shelter }) {
  const [step, setStep] = useState<Step>(1)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donationType, setDonationType] = useState<DonationType>('general')
  const [animalId, setAnimalId] = useState<number | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [method, setMethod] = useState<Method | null>(null)
  const [amount, setAmount] = useState('')
  const [operationReference, setOperationReference] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [donationId, setDonationId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedMethod = method ? shelter.payment_methods[method] : null
  const enabledMethods = useMemo(
    () => (['yape', 'plin'] as Method[]).filter(m => shelter.payment_methods[m]?.enabled),
    [shelter],
  )

  useEffect(() => {
    fetch(`${API}/public/shelters/${shelter.slug}/animals`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(r => (r.ok ? r.json() : []))
      .then(data => setAnimals(Array.isArray(data) ? data : []))
      .catch(() => setAnimals([]))
  }, [shelter.slug])

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  function pickFile(nextFile: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowed.includes(nextFile.type)) {
      setErrors(prev => ({ ...prev, file: 'Solo se aceptan JPG, PNG o GIF.' }))
      return
    }
    if (nextFile.size > MAX_SIZE) {
      setErrors(prev => ({ ...prev, file: `El archivo supera 5MB (${bytes(nextFile.size)}).` }))
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
    setErrors(prev => ({ ...prev, file: '' }))
  }

  function validate(targetStep: Step) {
    const next: Record<string, string> = {}
    if (targetStep >= 2) {
      if (!isAnonymous && !donorName.trim()) next.donorName = 'Ingresa tu nombre o marca donaciÃ³n anÃ³nima.'
      if (donorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail))
        next.donorEmail = 'Ingresa un email vÃ¡lido.'
      if (donationType === 'specific' && !animalId) next.animalId = 'Selecciona un animal del albergue.'
    }
    if (targetStep >= 3 && !method) next.method = 'Selecciona Yape o Plin.'
    if (targetStep >= 4) {
      if (!amount || Number(amount) <= 0) next.amount = 'El monto debe ser mayor a 0.'
      if (!operationReference.trim()) next.operationReference = 'El cÃ³digo de operaciÃ³n es obligatorio.'
      if (!file) next.file = 'Sube una imagen del comprobante.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function go(nextStep: Step) {
    if (validate(nextStep)) setStep(nextStep)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate(4)) return
    setLoading(true)
    setErrors({})

    const fd = new FormData()
    fd.append('shelter_id', String(shelter.id))
    fd.append('donation_type', donationType)
    fd.append('payment_method', method!)
    fd.append('amount', amount)
    fd.append('operation_reference', operationReference.trim())
    fd.append('is_anonymous', isAnonymous ? '1' : '0')
    fd.append('is_recurring', isRecurring ? '1' : '0')
    fd.append('donor_name', isAnonymous ? '' : donorName.trim())
    if (donorEmail.trim()) fd.append('donor_email', donorEmail.trim())
    if (notes.trim()) fd.append('notes', notes.trim())
    if (donationType === 'specific' && animalId) fd.append('animal_id', String(animalId))
    fd.append('voucher', file!)

    try {
      const res = await fetch(`${API}/donations`, {
        method: 'POST',
        headers: { Accept: 'application/json', ...authHeaders() },
        body: fd,
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const firstError = body?.errors ? Object.values(body.errors).flat()[0] : body?.message
        throw new Error(String(firstError ?? `Error ${res.status}`))
      }
      setDonationId(body.id ?? null)
      setStep(4)
    } catch (err) {
      setErrors({ submit: friendlyErrorMessage(err, 'No se pudo registrar la donaciÃ³n.') })
    } finally {
      setLoading(false)
    }
  }

  if (!shelter.accepts_donations) {
    return (
      <div className='rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900'>
        Este albergue aÃºn no tiene Yape o Plin configurado. Vuelve pronto o revisa otro albergue.
      </div>
    )
  }

  if (donationId) {
    return (
      <div className='rounded-lg border border-emerald-200 bg-cream-50 p-8 text-center shadow-sm'>
        <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700'>
          DonaciÃ³n recibida exitosamente
        </p>
        <h2 className='mt-3 text-3xl font-semibold text-slate-custom-900'>Gracias por apoyar a {shelter.name}</h2>
        <p className='mt-3 text-sm text-slate-custom-700'>
          Referencia: <span className='font-mono font-semibold'>#{donationId}</span>
        </p>
        <p className='mx-auto mt-4 max-w-md text-sm leading-6 text-slate-custom-700'>
          SerÃ¡ verificada en 24-48 horas. El equipo revisarÃ¡ el comprobante y actualizarÃ¡ el estado.
        </p>
        <div className='mt-6 flex justify-center gap-3'>
          <Link
            href='/donar'
            className='rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-custom-700'
          >
            Volver a albergues
          </Link>
          <Link
            href={`/refugios/${shelter.slug}/transparencia`}
            className='rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white'
          >
            Ver transparencia
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className='grid gap-5'>
      <section className='rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm'>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-brand-600'>Paso 1</p>
        <h2 className='mt-1 text-xl font-semibold'>Datos y destino</h2>
        <div className='mt-5 grid gap-4'>
          <label className='flex items-center gap-3 text-sm font-medium text-slate-custom-700'>
            <input type='checkbox' checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
            Donar como anÃ³nimo
          </label>
          <div className='grid gap-4 sm:grid-cols-2'>
            <label className='grid gap-1.5 text-sm'>
              Nombre del donante
              <input
                disabled={isAnonymous}
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                className='rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100'
              />
              {errors.donorName && <span className='text-xs text-rose-600'>{errors.donorName}</span>}
            </label>
            <label className='grid gap-1.5 text-sm'>
              Email opcional
              <input
                type='email'
                value={donorEmail}
                onChange={e => setDonorEmail(e.target.value)}
                className='rounded-md border border-slate-300 px-3 py-2'
              />
              {errors.donorEmail && <span className='text-xs text-rose-600'>{errors.donorEmail}</span>}
            </label>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <button
              type='button'
              onClick={() => {
                setDonationType('general')
                setAnimalId(null)
              }}
              className={`rounded-md border px-4 py-3 text-left ${donationType === 'general' ? 'border-teal-600 bg-teal-50' : 'border-slate-custom-50'}`}
            >
              <span className='block font-semibold'>DonaciÃ³n general</span>
              <span className='text-sm text-slate-custom-700'>Apoya las necesidades del albergue.</span>
            </button>
            <button
              type='button'
              onClick={() => setDonationType('specific')}
              className={`rounded-md border px-4 py-3 text-left ${donationType === 'specific' ? 'border-teal-600 bg-teal-50' : 'border-slate-custom-50'}`}
            >
              <span className='block font-semibold'>Apadrinar animal</span>
              <span className='text-sm text-slate-custom-700'>Elige un animal del refugio.</span>
            </button>
          </div>
          {donationType === 'specific' && (
            <div className='grid gap-3 sm:grid-cols-2'>
              {animals.map(animal => (
                <button
                  key={animal.id}
                  type='button'
                  onClick={() => setAnimalId(animal.id)}
                  className={`flex items-center gap-3 rounded-md border p-3 text-left ${animalId === animal.id ? 'border-teal-600 bg-teal-50' : 'border-slate-custom-50'}`}
                >
                  <div className='h-12 w-12 overflow-hidden rounded-md bg-slate-100'>
                    {animal.photos?.[0] && (
                      <img
                        src={`${mediaUrl(animal.photos[0].photo_path)}`}
                        alt={animal.name}
                        className='h-full w-full object-cover'
                      />
                    )}
                  </div>
                  <div>
                    <p className='font-semibold'>{animal.name}</p>
                    <p className='text-xs uppercase text-slate-500'>{animal.species}</p>
                  </div>
                </button>
              ))}
              {errors.animalId && <span className='text-xs text-rose-600'>{errors.animalId}</span>}
            </div>
          )}
          <label className='flex items-center gap-3 text-sm font-medium text-slate-custom-700'>
            <input type='checkbox' checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
            Â¿Deseas que sea un padrinazgo mensual?
          </label>
          <button
            type='button'
            onClick={() => go(2)}
            className='w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white'
          >
            Continuar
          </button>
        </div>
      </section>

      {step >= 2 && (
        <section className='rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-brand-600'>Paso 2</p>
          <h2 className='mt-1 text-xl font-semibold'>MÃ©todo de pago</h2>
          <div className='mt-5 grid gap-3 sm:grid-cols-2'>
            {enabledMethods.map(option => {
              const data = shelter.payment_methods[option]
              return (
                <button
                  key={option}
                  type='button'
                  onClick={() => setMethod(option)}
                  className={`rounded-md border p-4 text-left ${method === option ? 'border-teal-600 bg-teal-50' : 'border-slate-custom-50'}`}
                >
                  <span className='block text-lg font-semibold uppercase'>{option}</span>
                  <span className='block font-mono text-xl'>{data.phone}</span>
                  <span className='block text-sm text-slate-custom-700'>Titular: {data.owner}</span>
                </button>
              )
            })}
          </div>
          {selectedMethod && (
            <div className='mt-4 rounded-md border border-slate-custom-50 bg-cream-100 p-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <p className='text-sm text-slate-custom-700'>
                  Escanea el QR o envÃ­a al nÃºmero, luego sube comprobante.
                </p>
                <button
                  type='button'
                  onClick={() => navigator.clipboard.writeText(selectedMethod.phone ?? '')}
                  className='rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold'
                >
                  Copiar nÃºmero
                </button>
              </div>
              {selectedMethod.qr_path && (
                <img
                  src={`${mediaUrl(selectedMethod.qr_path)}`}
                  alt='QR de pago'
                  className='mt-4 h-40 w-40 rounded-md border bg-cream-50 object-contain p-1'
                />
              )}
            </div>
          )}
          {errors.method && <p className='mt-2 text-xs text-rose-600'>{errors.method}</p>}
          <button
            type='button'
            onClick={() => go(3)}
            className='mt-4 w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white'
          >
            Continuar
          </button>
        </section>
      )}

      {step >= 3 && (
        <section className='rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-brand-600'>Paso 3</p>
          <h2 className='mt-1 text-xl font-semibold'>Registro de pago</h2>
          <div className='mt-5 grid gap-4 sm:grid-cols-2'>
            <label className='grid gap-1.5 text-sm'>
              Monto exacto transferido
              <input
                type='number'
                min='0.01'
                step='0.01'
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className='rounded-md border border-slate-300 px-3 py-2'
              />
              {errors.amount && <span className='text-xs text-rose-600'>{errors.amount}</span>}
            </label>
            <label className='grid gap-1.5 text-sm'>
              CÃ³digo/nÃºmero de operaciÃ³n
              <input
                value={operationReference}
                onChange={e => setOperationReference(e.target.value)}
                className='rounded-md border border-slate-300 px-3 py-2'
              />
              {errors.operationReference && <span className='text-xs text-rose-600'>{errors.operationReference}</span>}
            </label>
          </div>
          <label className='mt-4 grid gap-1.5 text-sm'>
            Mensaje opcional
            <textarea
              maxLength={500}
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className='rounded-md border border-slate-300 px-3 py-2'
            />
            <span className='text-right text-xs text-slate-500'>{notes.length}/500</span>
          </label>
          <div className='mt-4'>
            {!file ? (
              <div
                onDrop={e => {
                  e.preventDefault()
                  const next = e.dataTransfer.files[0]
                  if (next) pickFile(next)
                }}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className='cursor-pointer rounded-md border-2 border-dashed border-slate-300 bg-cream-100 px-6 py-8 text-center text-sm text-slate-custom-700'
              >
                Arrastra el voucher aquÃ­ o selecciona archivo. JPG, PNG o GIF, mÃ¡ximo 5MB.
              </div>
            ) : (
              <div className='rounded-md border border-slate-custom-50 p-3'>
                {preview && (
                  <img src={preview} alt='Vista previa comprobante' className='max-h-64 w-full object-contain' />
                )}
                <div className='mt-3 flex items-center justify-between gap-3 text-sm'>
                  <span className='truncate'>
                    {file.name} Â· {bytes(file.size)}
                  </span>
                  <button
                    type='button'
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                    className='text-rose-600'
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileRef}
              type='file'
              accept='image/jpeg,image/png,image/gif'
              className='hidden'
              onChange={e => {
                const next = e.target.files?.[0]
                if (next) pickFile(next)
              }}
            />
            {errors.file && <p className='mt-2 text-xs text-rose-600'>{errors.file}</p>}
          </div>
          {errors.submit && (
            <p className='mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
              {errors.submit}
            </p>
          )}
          <button
            disabled={loading}
            className='mt-5 rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50'
          >
            {loading ? 'Enviando...' : 'Enviar DonaciÃ³n'}
          </button>
        </section>
      )}
    </form>
  )
}
