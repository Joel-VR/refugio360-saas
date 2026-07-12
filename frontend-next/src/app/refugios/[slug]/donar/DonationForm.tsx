'use client';

import { useCallback, useRef, useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');
const STORAGE  = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:8000/storage';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

interface Shelter {
  id: number;
  name: string;
  yape_phone: string | null;
  yape_owner: string | null;
  yape_qr_path: string | null;
  plin_phone: string | null;
  plin_owner: string | null;
  plin_qr_path: string | null;
}

type Method = 'yape' | 'plin';
type Phase  = 'method' | 'payment' | 'success';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBytes(b: number) {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function CopyButton({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        copied
          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
          : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
      }`}
    >
      {copied ? '✓ Número copiado' : '📋 Copiar número'}
    </button>
  );
}

function PaymentMethodCard({
  method, shelter, selected, onSelect,
}: {
  method: Method;
  shelter: Shelter;
  selected: boolean;
  onSelect: () => void;
}) {
  const isYape  = method === 'yape';
  const phone   = isYape ? shelter.yape_phone   : shelter.plin_phone;
  const owner   = isYape ? shelter.yape_owner   : shelter.plin_owner;
  const qrPath  = isYape ? shelter.yape_qr_path : shelter.plin_qr_path;
  const color   = isYape ? 'from-violet-600 to-purple-700' : 'from-cyan-500 to-blue-600';
  const label   = isYape ? 'Yape' : 'Plin';
  const emoji   = isYape ? '💜' : '💙';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-4 rounded-2xl border p-5 text-left transition ${
        selected
          ? 'border-cyan-400/60 bg-cyan-400/5 ring-1 ring-cyan-400/30'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${color} text-lg`}>
          {emoji}
        </span>
        <span className="text-base font-semibold text-slate-100">{label}</span>
        {selected && <span className="ml-auto text-xs text-cyan-400">✓ Seleccionado</span>}
      </div>

      {phone ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">Número</p>
            <p className="text-lg font-mono font-bold text-slate-100">{phone}</p>
            {owner && <p className="text-xs text-slate-400 mt-1">Titular: {owner}</p>}
          </div>
          {selected && <CopyButton phone={phone} />}
          {qrPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${STORAGE}/${qrPath}`}
              alt={`QR ${label}`}
              className="mx-auto w-40 rounded-xl border border-white/10"
            />
          )}
          {selected && (
            <p className="text-xs text-slate-400 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              📲 Escanea el QR o envía al número de arriba, luego sube tu comprobante abajo.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">No configurado aún.</p>
      )}
    </button>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function DonationForm({ shelter }: { shelter: Shelter }) {
  const [phase,     setPhase]     = useState<Phase>('method');
  const [method,    setMethod]    = useState<Method | null>(null);
  const [donorName, setDonorName] = useState('');
  const [email,     setEmail]     = useState('');
  const [amount,    setAmount]    = useState('');
  const [opRef,     setOpRef]     = useState('');
  const [notes,     setNotes]     = useState('');
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(false);
  const [donationId, setDonationId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── file handling ──────────────────────────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    setFileError('');
    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowed.includes(f.type)) {
      setFileError('Solo se aceptan imágenes JPG, PNG o GIF.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setFileError(`El archivo es demasiado grande (${formatBytes(f.size)}). Máximo 5 MB.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  // ── validation ─────────────────────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!donorName.trim()) e.donorName = 'El nombre es obligatorio.';
    if (!email.trim())     e.email     = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email no válido.';
    if (!amount || Number(amount) <= 0) e.amount = 'Ingresa un monto mayor a 0.';
    if (!opRef.trim()) e.opRef = 'El código de operación es obligatorio.';
    if (!file)         e.file  = 'Debes subir el comprobante de pago.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const fd = new FormData();
    fd.append('shelter_id',          String(shelter.id));
    fd.append('payment_method',      method!);
    fd.append('donor_name',          donorName);
    fd.append('donor_email',         email);
    fd.append('amount',              amount);
    fd.append('operation_reference', opRef);
    fd.append('notes',               notes);
    fd.append('voucher',             file!);

    try {
      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? `Error ${res.status}`);
      setDonationId(body.id ?? body.data?.id ?? null);
      setPhase('success');
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Error desconocido.' });
    } finally {
      setLoading(false);
    }
  }

  // ── success screen ─────────────────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-10 text-center">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-emerald-300">¡Donación recibida exitosamente!</h2>
        {donationId && (
          <p className="mt-3 text-sm text-slate-400">
            N° de referencia: <span className="font-mono font-bold text-slate-200">#{donationId}</span>
          </p>
        )}
        <p className="mt-4 text-sm text-slate-400 max-w-sm mx-auto">
          Tu donación será verificada por el equipo del albergue en <strong className="text-slate-300">24-48 horas</strong>. ¡Gracias por tu apoyo! 💙
        </p>
        <a
          href="/"
          className="mt-8 inline-block rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Volver al albergue
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* ── PASO 1 + 2: método de pago ─────────────────────────────────────── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-widest text-cyan-300 mb-1">Paso 1</p>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Selecciona el método de pago</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <PaymentMethodCard method="yape" shelter={shelter} selected={method === 'yape'} onSelect={() => setMethod('yape')} />
          <PaymentMethodCard method="plin" shelter={shelter} selected={method === 'plin'} onSelect={() => setMethod('plin')} />
        </div>
      </div>

      {/* ── PASO 3: datos del donante + pago ───────────────────────────────── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-widest text-cyan-300 mb-1">Paso 2</p>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Registro de pago</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-300">Nombre completo <span className="text-rose-400">*</span></label>
            <input
              value={donorName}
              onChange={e => setDonorName(e.target.value)}
              placeholder="Ana García"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition"
            />
            {errors.donorName && <p className="text-xs text-rose-400">{errors.donorName}</p>}
          </div>

          {/* email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-300">Email <span className="text-rose-400">*</span></label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ana@email.com"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition"
            />
            {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
          </div>

          {/* monto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-300">Monto transferido (S/.) <span className="text-rose-400">*</span></label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="50.00"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition"
            />
            {errors.amount && <p className="text-xs text-rose-400">{errors.amount}</p>}
          </div>

          {/* código de operación */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-300">Código de operación <span className="text-rose-400">*</span></label>
            <input
              value={opRef}
              onChange={e => setOpRef(e.target.value)}
              placeholder="ej. 123456789"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition"
            />
            {errors.opRef && <p className="text-xs text-rose-400">{errors.opRef}</p>}
          </div>
        </div>

        {/* notas */}
        <div className="flex flex-col gap-1.5 mt-4">
          <label className="text-sm text-slate-300">
            Mensaje para el albergue <span className="text-slate-500">(opcional)</span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Cuéntanos algo si quieres..."
            className="resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition"
          />
          <p className="text-xs text-slate-500 text-right">{notes.length}/500</p>
        </div>
      </div>

      {/* ── PASO 4: comprobante ────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-widest text-cyan-300 mb-1">Paso 3</p>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Sube tu comprobante</h2>

        {!file ? (
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/40 px-6 py-10 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/5 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <p className="text-3xl">📎</p>
            <p className="text-sm text-slate-300 font-medium">Arrastra tu imagen aquí</p>
            <p className="text-xs text-slate-500">JPG, PNG o GIF · máximo 5 MB</p>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
            >
              Seleccionar archivo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* preview */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview!} alt="Comprobante" className="w-full max-h-64 object-contain bg-slate-950" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm">
              <div>
                <p className="text-slate-200 font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-rose-400 hover:text-rose-300 text-xs border border-rose-400/30 rounded-full px-3 py-1 transition hover:bg-rose-400/10"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {fileError && <p className="mt-2 text-xs text-rose-400">{fileError}</p>}
        {errors.file && <p className="mt-2 text-xs text-rose-400">{errors.file}</p>}
      </div>

      {/* error general */}
      {errors.submit && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {errors.submit}
        </p>
      )}

      {/* método no seleccionado */}
      {!method && (
        <p className="text-center text-xs text-slate-500">Selecciona un método de pago para continuar.</p>
      )}

      {/* submit */}
      <button
        type="submit"
        disabled={loading || !method}
        className="rounded-full bg-cyan-400 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Enviando donación…
          </>
        ) : '💙 Enviar Donación'}
      </button>
    </form>
  );
}
