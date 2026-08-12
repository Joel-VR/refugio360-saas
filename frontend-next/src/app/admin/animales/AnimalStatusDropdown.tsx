'use client';

import { useState } from 'react';
import { authHeaders, API_BASE_URL as API } from '@/lib/api';

const STATUSES = [
  { value: 'apto',        label: 'Apto adopción' },
  { value: 'cuarentena',  label: 'Cuarentena' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'adoptado',    label: 'Adoptado' },
];

const COLORS: Record<string, string> = {
  apto:        'bg-emerald-100 text-emerald-700 border-emerald-300',
  cuarentena:  'bg-amber-100 text-amber-700 border-amber-300',
  tratamiento: 'bg-orange-100 text-orange-700 border-orange-300',
  adoptado:    'bg-slate-100 text-slate-500 border-slate-300',
};

export function AnimalStatusDropdown({ animalId, current }: { animalId: number; current: string }) {
  const [status, setStatus]   = useState(current);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  async function handleChange(newStatus: string) {
    setSaving(true);
    const res = await fetch(`${API}/animals/${animalId}`, {
      method: 'PUT',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ lifecycle_status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        className={`rounded-full border px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-600 transition ${COLORS[status] ?? 'bg-slate-100 text-slate-500 border-slate-300'}`}
      >
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-slate-400">guardando...</span>}
      {saved  && <span className="text-xs text-emerald-600">✓ guardado</span>}
    </div>
  );
}