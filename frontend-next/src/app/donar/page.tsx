'use client';

import { useEffect, useRef, useState } from 'react';

const API     = (process.env.NEXT_PUBLIC_API_URL     ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');
const STORAGE = (process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:8000/storage');
const MAX_SIZE = 5 * 1024 * 1024;

interface Shelter { id: number; name: string; slug: string; yape_phone: string|null; yape_owner: string|null; yape_qr_path: string|null; plin_phone: string|null; plin_owner: string|null; plin_qr_path: string|null; }
interface Animal  { id: number; name: string; species: string; lifecycle_status: string; photos?: { photo_path: string }[]; }
type DonationType = 'shelter' | 'animal';
type Method       = 'yape' | 'plin';

const SPECIES_LABEL: Record<string, string> = {
  perro: "🐶 Perro",
  gato: "🐱 Gato",
  otro: "🐾 Otro",
};

function fmt(b: number) { return b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`; }

// ── CopyButton ────────────────────────────────────────────────────────────────
function CopyButton({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { 
    try {
      await navigator.clipboard.writeText(phone); 
      setCopied(true); 
      setTimeout(() => setCopied(false), 2000); 
    } catch {}
  }
  return (
    <button type="button" onClick={copy}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${copied ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'}`}>
      {copied ? 'Copiado' : 'Copiar número'}
    </button>
  );
}

// ── ThankYouCard ──────────────────────────────────────────────────────────────
function ThankYouCard({ donationId, resetFlow }: { donationId: number | null; resetFlow: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] text-slate-100">
      <div className="w-full max-w-lg">
        <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/60 p-10 shadow-xl shadow-black/30 text-center overflow-hidden backdrop-blur-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 mb-5 tracking-widest uppercase">
            Donación recibida
          </span>
          <h2 className="text-3xl font-bold text-slate-100 leading-tight mb-2">Gracias por tu apoyo</h2>
          {donationId && (
            <p className="text-xs text-slate-500 mb-5">Referencia <span className="font-mono text-slate-300">#{String(donationId).padStart(6,'0')}</span></p>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-left mb-8">
            <p className="text-sm text-slate-400 leading-7 italic">
              "Si pudiera escribir, te diría que hoy mi plato está lleno
              y mi cama es un poco más cálida gracias a ti.
              No sé tu nombre, pero lo llevo en el corazón."
              <span className="not-italic block mt-1 text-slate-500">— Un habitante agradecido del refugio</span>
            </p>
          </div>

          <p className="text-xs text-slate-500 mb-8">
            Tu donación será verificada en <span className="text-slate-300 font-medium">24 a 48 horas</span>.<br/>
            Te notificaremos por correo cuando sea aprobada.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={resetFlow} className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition">
              Realizar otra donación
            </button>
            <a href="/" className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-400 hover:border-white/20 hover:text-slate-300 transition">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DonarPage() {
  const [shelters,     setShelters]     = useState<Shelter[]>([]);
  const [animals,      setAnimals]      = useState<Animal[]>([]);
  const [step,         setStep]         = useState<'landing'|'type'|'form'|'success'>('landing');
  const [donationType, setDonationType] = useState<DonationType|null>(null);
  const [animal,       setAnimal]       = useState<Animal|null>(null);
  const [method,       setMethod]       = useState<Method|null>(null);
  const [donorName,    setDonorName]    = useState('');
  const [email,        setEmail]        = useState('');
  const [amount,       setAmount]       = useState('');
  const [opRef,        setOpRef]        = useState('');
  const [notes,        setNotes]        = useState('');
  const [file,         setFile]         = useState<File|null>(null);
  const [preview,      setPreview]      = useState<string|null>(null);
  const [fileError,    setFileError]    = useState('');
  const [errors,       setErrors]       = useState<Record<string,string>>({});
  const [loading,      setLoading]      = useState(false);
  const [donationId,   setDonationId]   = useState<number|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/shelters`).then(r=>r.json()).then(d=>setShelters(Array.isArray(d)?d:[])).catch(()=>{});
    fetch(`${API}/animals`).then(r=>r.json()).then(d=>setAnimals(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function handleFile(f: File) {
    setFileError('');
    if (!['image/jpeg','image/png','image/gif'].includes(f.type)) { setFileError('Solo se aceptan JPG, PNG o GIF.'); return; }
    if (f.size > MAX_SIZE) { setFileError(`El archivo excede el tamaño máximo de 5 MB (${fmt(f.size)}).`); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f); setPreview(URL.createObjectURL(f));
  }

  function resetFlow() {
    setDonationType(null); setAnimal(null); setMethod(null);
    setDonorName(''); setEmail(''); setAmount(''); setOpRef(''); setNotes('');
    setFile(null); if (preview) URL.revokeObjectURL(preview); setPreview(null);
    setFileError(''); setErrors({}); setDonationId(null); setStep('landing');
  }

  function validate() {
    const e: Record<string,string> = {};
    if (!donorName.trim()) e.donorName = 'El nombre es obligatorio.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ingresa un correo válido.';
    if (!amount || Number(amount) <= 0) e.amount = 'El monto debe ser mayor a cero.';
    if (!opRef.trim()) e.opRef = 'El código de operación es obligatorio.';
    if (!file) e.file = 'Debes subir el comprobante de pago.';
    if (donationType === 'animal' && !animal) e.animal = 'Debes seleccionar un animal.';
    setErrors(e); return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setErrors({});
    const shelter = shelters[0];
    const fd = new FormData();
    fd.append('shelter_id',          String(shelter?.id ?? 1));
    fd.append('payment_method',      method!);
    fd.append('donor_name',          donorName.trim());
    fd.append('donor_email',         email.trim());
    fd.append('amount',              amount);
    fd.append('operation_reference', opRef.trim());
    fd.append('notes',               notes.trim());
    fd.append('voucher',             file!);
    if (animal) fd.append('animal_id', String(animal.id));

    try {
      const res  = await fetch(`${API}/donations`, { method:'POST', headers:{Accept:'application/json'}, body:fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? `Error ${res.status}`);
      setDonationId(body.id ?? body.data?.id ?? null);
      setStep('success');
    } catch(err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Error inesperado.' });
    } finally { setLoading(false); } 
  }

  if (step === 'success') return <ThankYouCard donationId={donationId} resetFlow={resetFlow}/>;

  // ── LANDING ─────────────────────────────────────────────────────────────────
  if (step === 'landing') {
    return (
      <div className="min-h-screen text-slate-100 bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)]">
        {/* HERO */}
        <section className="relative px-6 pt-32 pb-24 overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 mb-4">Refugio360 — Apoyo</p>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Tu donación<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">cambia vidas</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-md">
  Cada aporte que realizas se destina directamente a la alimentación, atención veterinaria y bienestar de los animales bajo nuestro cuidado.
</p>

{/* CONTENEDOR CON ESPACIO ARRIBA */}
<div className="mt-10">
  <button 
    onClick={() => setStep('type')}
    className="w-full max-w-xs py-4 rounded-full bg-cyan-400 text-lg font-bold text-slate-950 text-center tracking-wide transition duration-300 hover:bg-cyan-300 shadow-xl shadow-cyan-400/20"
  >
    Donar ahora
  </button>
</div>
            </div>

           
          </div>
        </section>

        {/* TRANSPARENCIA */}
        <section className="px-6 py-16 max-w-6xl mx-auto border-t border-white/10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest text-cyan-300 mb-4">Transparencia</p>
              <h2 className="text-3xl font-bold text-slate-100 mb-4">¿A dónde va tu dinero?</h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                El 100% de las donaciones recibidas se destina a cubrir las necesidades directas de los animales en el refugio.
                Esto incluye la compra de alimento balanceado diario, medicamentos y atención veterinaria preventiva,
                mantenimiento de las instalaciones, y los insumos necesarios para el proceso de adopción responsable.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                ['Alimentación', 'Proveemos alimentación balanceada diaria adaptada a la edad y condición de cada animal.'],
                ['Atención veterinaria', 'Cubrimos vacunas, desparasitaciones, esterilizaciones y tratamientos de emergencia.'],
                ['Infraestructura', 'Mantenemos espacios limpios, seguros y con condiciones adecuadas para el bienestar animal.'],
              ].map(([t,d]) => (
                <div key={t} className="rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-5 shadow-lg shadow-black/10">
                  <p className="text-sm font-semibold text-slate-200 mb-1">{t}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 text-center border-t border-white/10 pt-16">
          <p className="text-slate-400 text-sm mb-6">Cada aporte, sin importar el monto, hace una diferencia real.</p>
          
        </section>
      </div>
    );
  }
// ── TYPE ────────────────────────────────────────────────────────────────────
  if (step === 'type') return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] text-slate-100">
      <div className="w-full max-w-3xl">
        
        {/* BOTÓN VOLVER ESTILIZADO */}
          <button 
            type="button"
            onClick={resetFlow} // <--- CAMBIA ESTO AQUÍ (Ejecuta tu función mágica)
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200 transition"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver
          </button>

        <h2 className="text-4xl font-bold tracking-tight text-slate-100 mb-8">¿Cómo deseas donar?</h2>
        
        <div className="grid sm:grid-cols-2 gap-6">
          {/* OPCIÓN 1: DONACIÓN GENERAL */}
          <button 
            onClick={() => { setDonationType('shelter'); setAnimal(null); setStep('form'); }}
            className="group flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-left hover:border-cyan-400/30 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
          >
            {/* Contenedor del Icono Forzado con Dimensiones Estrictas */}
            <div className="w-14 h-14 max-w-[56px] max-h-[56px] rounded-2xl bg-slate-800 border border-white/5 group-hover:bg-cyan-400/10 group-hover:border-cyan-400/20 transition-all duration-300 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-300 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-100 text-xl mb-2 transition-colors group-hover:text-cyan-300">Donación general</p>
              <p className="text-sm text-slate-400 leading-relaxed">Tu aporte se destina al fondo común que cubre las necesidades globales de todos los animales.</p>
            </div>
          </button>

          {/* OPCIÓN 2: ANIMAL ESPECÍFICO */}
          <button 
            onClick={() => { setDonationType('animal'); setStep('form'); }}
            className="group flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-left hover:border-cyan-400/30 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
          >
            {/* Contenedor del Icono Forzado con Dimensiones Estrictas */}
            <div className="w-14 h-14 max-w-[56px] max-h-[56px] rounded-2xl bg-slate-800 border border-white/5 group-hover:bg-cyan-400/10 group-hover:border-cyan-400/20 transition-all duration-300 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-300 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-100 text-xl mb-2 transition-colors group-hover:text-cyan-300">Para un animal específico</p>
              <p className="text-sm text-slate-400 leading-relaxed">Elige directamente al perrito o gatito que quieres apoyar con tu donación.</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
 // ── FORM ────────────────────────────────────────────────────────────────────
  // Aseguramos que si shelters no existe o está vacío, no rompa el renderizado
  const shelter = (typeof shelters !== 'undefined' && shelters && shelters.length > 0) ? shelters[0] : null;
  const phone   = method === 'yape' ? shelter?.yape_phone   : shelter?.plin_phone;
  const owner   = method === 'yape' ? shelter?.yape_owner   : shelter?.plin_owner;
  const qrPath  = method === 'yape' ? shelter?.yape_qr_path : shelter?.plin_qr_path;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] px-4 py-16 text-slate-100">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* BOTÓN VOLVER ESTILIZADO */}
            <button 
              type="button"
              onClick={resetFlow} // <--- CAMBIA ESTO AQUÍ (Ejecuta tu función mágica)
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver
            </button>
        <div>
          <p className="text-sm uppercase tracking-widest text-cyan-300 mb-1">
            {donationType === 'animal' ? 'Donación enfocada' : 'Donación general'}
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-100">Registra tu aporte</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Selector de Animales Estilo Card List — Corrección Anti-Desaparición */}
          {donationType === 'animal' && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Selecciona un compañero <span className="text-rose-400">*</span></p>
              {errors.animal && <p className="text-xs text-rose-400 mb-3">{errors.animal}</p>}
              
              {(!animals || animals.length === 0) ? (
                <p className="text-sm text-slate-500 italic">Cargando compañeros o no hay animales registrados aún...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {animals.map(a => {
                    const photo = a.photos?.[0];
                    const sel   = animal?.id === a.id;
                    return (
                      <button 
                        key={a.id} 
                        type="button" 
                        onClick={() => setAnimal(a)}
                        className={`group relative flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                          sel 
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/5' 
                            : 'border-white/5 bg-slate-950/40 hover:border-white/20'
                        }`}
                      >
                        {/* Contenedor de Imagen Estricto */}
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 overflow-hidden flex flex-shrink-0 items-center justify-center text-xl">
                          {photo ? (
                            <img src={`${STORAGE}/${photo.photo_path}`} alt={a.name} className="w-full h-full object-cover"/>
                          ) : (
                            <span>{a.species === 'gato' ? '🐱' : '🐶'}</span>
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${sel ? 'text-cyan-300' : 'text-slate-200'}`}>{a.name}</p>
                          <span className={`inline-block px-1.5 py-0.5 mt-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                            a.species === 'gato' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {typeof SPECIES_LABEL !== 'undefined' && SPECIES_LABEL[a.species] ? SPECIES_LABEL[a.species] : a.species}
                          </span>
                        </div>
                        
                        {sel && <span className="text-cyan-400 text-sm font-bold absolute top-2 right-3">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Método de pago con COLORES DE FONDO COMPLETOS Y SÓLIDOS */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Método de pago <span className="text-rose-400">*</span></p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              
              {/* Botón YAPE (Fondo Morado Completo) */}
              <button 
                type="button" 
                onClick={() => setMethod('yape')}
                className={`rounded-2xl py-4 text-base font-bold transition-all uppercase tracking-wider text-white ${
                  method === 'yape' 
                    ? 'bg-purple-600 border-2 border-purple-300 shadow-xl shadow-purple-600/40 scale-[1.02]' 
                    : 'bg-purple-900/40 border border-purple-700/40 opacity-60 hover:opacity-100'
                }`}
              >
                YAPE
              </button>

              {/* Botón PLIN (Fondo Verde Completo) */}
              <button 
                type="button" 
                onClick={() => setMethod('plin')}
                className={`rounded-2xl py-4 text-base font-bold transition-all uppercase tracking-wider text-white ${
                  method === 'plin' 
                    ? 'bg-teal-600 border-2 border-teal-300 shadow-xl shadow-teal-600/40 scale-[1.02]' 
                    : 'bg-teal-900/40 border border-teal-700/40 opacity-60 hover:opacity-100'
                }`}
              >
                PLIN
              </button>
            </div>

            {/* Bloque Informativo de Pago */}
            {method && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 flex flex-col gap-4">
                {phone ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Número de envío</p>
                        <p className="text-2xl font-mono font-bold text-slate-100 tracking-tight">{phone}</p>
                        {owner && <p className="text-xs text-slate-400 mt-1">Titular: <span className="text-slate-300 font-medium">{owner}</span></p>}
                      </div>
                      <CopyButton phone={phone}/>
                    </div>
                    {qrPath && <img src={`${STORAGE}/${qrPath}`} alt="QR Code" className="w-32 rounded-2xl border border-white/10 mx-auto bg-white p-1 shadow-md shadow-black/40"/>}
                    <p className="text-xs text-slate-400 bg-white/5 rounded-xl px-4 py-3 border border-white/5 leading-relaxed">
                      Efectúa la transferencia desde tu app, guarda una captura de pantalla del comprobante y adjúntala abajo.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 italic">Datos de {method} no configurados en este refugio.</p>
                )}
              </div>
            )}
          </div>

          {/* Campos de texto */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Tus datos</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label:'Nombre completo', key:'donorName', value:donorName, set:setDonorName, ph:'Ana García',       type:'text'   },
                { label:'Correo electrónico', key:'email',  value:email,     set:setEmail,     ph:'ana@email.com',   type:'email'  },
                { label:'Monto transferido (S/.)', key:'amount', value:amount, set:setAmount,  ph:'50.00',           type:'number' },
                { label:'Código de operación', key:'opRef', value:opRef,     set:setOpRef,     ph:'123456789',       type:'text'   },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{f.label} <span className="text-rose-400">*</span></label>
                  <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} step={f.type === 'number' ? 'any' : undefined}
                    className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/10 transition"/>
                  {errors[f.key] && <p className="text-xs text-rose-400 mt-0.5">{errors[f.key]}</p>}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mensaje <span className="text-slate-600 text-xs">(opcional)</span></label>
              <textarea rows={2} maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Escribe un mensaje opcional para el refugio..."
                className="resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/10 transition"/>
              <p className="text-xs text-slate-500 text-right mt-1">{notes.length}/500</p>
            </div>
          </div>

          {/* Adjuntar comprobante */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Comprobante de pago <span className="text-rose-400">*</span></p>
            {!file ? (
              <div 
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleFile(f); }} 
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/40 px-6 py-10 text-center cursor-pointer hover:border-cyan-500/30 hover:bg-slate-900/40 transition duration-300"
              >
                <div className="w-14 h-14 max-w-[56px] max-h-[56px] flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/5 transition mb-2">
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                
                <p className="text-sm font-medium text-slate-300 group-hover:text-cyan-300 transition">
                  Arrastra tu comprobante aquí o <span className="text-cyan-400 underline decoration-cyan-400/30">búscalo</span>
                </p>
                <p className="text-xs text-slate-500">JPG, PNG o GIF — máximo 5 MB</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-inner">
                  {preview && <img src={preview} alt="Comprobante" className="w-full max-h-48 object-contain bg-slate-950"/>}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-sm text-slate-200 font-medium truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{fmt(file.size)}</p>
                  </div>
                  <button type="button" onClick={() => { setFile(null); setPreview(null); if(fileRef.current) fileRef.current.value=''; }}
                    className="text-xs text-rose-400 border border-rose-400/30 rounded-full px-3 py-1.5 hover:bg-rose-400/10 transition whitespace-nowrap">
                    Eliminar
                  </button>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if(f) handleFile(f); }}/>
            {fileError && <p className="mt-2 text-xs text-rose-400">{fileError}</p>}
            {errors.file && <p className="mt-2 text-xs text-rose-400">{errors.file}</p>}
          </div>

          {errors.submit && (
            <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{errors.submit}</p>
          )}

          {!method && <p className="text-center text-xs text-slate-500">Selecciona un método de pago para habilitar el envío.</p>}

          <button 
            type="submit" 
            disabled={loading || !method || (donationType === 'animal' && !animal)}
            className="w-full mt-2 rounded-full bg-cyan-400 py-4 text-base font-bold text-slate-950 hover:bg-cyan-300 transition disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/10"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Procesando…
              </>
            ) : (
              'Enviar registro de donación'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}