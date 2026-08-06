'use client';

import { useEffect, useState } from 'react';

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');
const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:8000/storage';

const CATEGORIES = [
  { value: 'alimentacion',    label: 'alimentacion'    },
  { value: 'veterinaria',     label: 'veterinaria'     },
  { value: 'infraestructura', label: 'infraestructura' },
  { value: 'otros',           label: 'otros'           },
];

const CATEGORY_LABELS: Record<string, string> = {
  alimentacion:    'alimentacion',
  veterinaria:     'veterinaria',
  infraestructura: 'infraestructura',
  otros:           'otros',
};

interface Expense {
  id: number;
  description: string;
  amount: string;
  category: string;
  expense_date: string;
  status: string;
  document_path: string | null;
}

function money(v: string | number) {
  return `S/. ${Number(v ?? 0).toFixed(2)}`;
}

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' };
}

export default function AdminTransparenciaPage() {
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    description:  '',
    amount:       '',
    category:     'alimentacion',
    expense_date: new Date().toISOString().split('T')[0],
  });
  const [file, setFile] = useState<File | null>(null);

  const totalGastos = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const byCategory = CATEGORIES.map(cat => ({
    label: cat.label,
    total: expenses
      .filter(e => e.category === cat.value)
      .reduce((acc, e) => acc + Number(e.amount), 0),
  }));

  const maxCat = Math.max(1, ...byCategory.map(c => c.total));

  function loadExpenses() {
    setLoading(true);
    fetch(`${API}/admin/expenses`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setExpenses(data.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadExpenses(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');

    const fd = new FormData();
    fd.append('description',  form.description);
    fd.append('amount',       form.amount);
    fd.append('category',     form.category);
    fd.append('expense_date', form.expense_date);
    if (file) fd.append('document', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const res = await fetch(`${API}/admin/expenses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      body: fd,
    });

    if (res.ok) {
      setSuccess('gasto registrado correctamente');
      setForm({
        description:  '',
        amount:       '',
        category:     'alimentacion',
        expense_date: new Date().toISOString().split('T')[0],
      });
      setFile(null);
      loadExpenses();
    } else {
      const data = await res.json();
      setError(data.message ?? 'error al registrar el gasto');
    }
    setSubmitting(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('eliminar este gasto?')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    await fetch(`${API}/admin/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    loadExpenses();
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto grid max-w-5xl gap-8">

        <div>
          <h1 className="text-3xl font-semibold">transparencia del albergue</h1>
          <p className="mt-1 text-sm text-slate-400">
            registra los gastos del albergue y consulta el resumen financiero
          </p>
        </div>

        {/* resumen */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">total gastos</p>
            <p className="mt-2 text-3xl font-semibold">{money(totalGastos)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">gastos registrados</p>
            <p className="mt-2 text-3xl font-semibold">{expenses.length}</p>
          </div>
        </div>

        {/* distribucion por categoria */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-lg font-semibold">distribucion por categoria</h2>
          <div className="grid gap-3">
            {byCategory.map(cat => (
              <div key={cat.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cat.label}</span>
                  <span className="font-semibold">{money(cat.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-brand-600"
                    style={{ width: `${Math.max(2, (cat.total / maxCat) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* formulario nuevo gasto */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-lg font-semibold">registrar nuevo gasto</h2>
          {success && (
            <p className="mb-3 rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-400">{success}</p>
          )}
          {error && (
            <p className="mb-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                descripcion
              </label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="ej. compra de alimento para perros"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                monto (S/.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                categoria
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                fecha del gasto
              </label>
              <input
                type="date"
                value={form.expense_date}
                onChange={e => setForm({ ...form, expense_date: e.target.value })}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                comprobante (opcional)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1 file:text-xs file:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-brand-600 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? 'registrando...' : 'registrar gasto'}
              </button>
            </div>
          </form>
        </div>

        {/* lista de gastos */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-lg font-semibold">gastos registrados</h2>
          {loading ? (
            <p className="text-sm text-slate-400">cargando...</p>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-slate-400">no hay gastos registrados aun</p>
          ) : (
            <div className="grid gap-3">
              {expenses.map(expense => (
                <article
                  key={expense.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-white/10 p-4"
                >
                  <div>
                    <p className="font-semibold text-sm">{expense.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {CATEGORY_LABELS[expense.category] ?? expense.category}
                      {' · '}
                      {new Date(expense.expense_date).toLocaleDateString('es-PE')}
                    </p>
                    {expense.document_path && (
                      <a
                        href={`${STORAGE}/${expense.document_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs font-semibold text-brand-400"
                      >
                        ver comprobante
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold text-sm">{money(expense.amount)}</p>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </section>
    </main>
  );
}