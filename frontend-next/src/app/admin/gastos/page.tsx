'use client';

import { useEffect, useState } from 'react';
import { authHeaders, pageInfoFrom, type PageInfo } from '@/lib/api';
import { Pagination } from '@/components/Pagination';

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');
const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:8000/storage';

const CATEGORIES = [
  { value: 'alimentacion',    label: 'Alimentación' },
  { value: 'veterinaria',     label: 'Veterinaria' },
  { value: 'infraestructura', label: 'Infraestructura' },
  { value: 'otros',           label: 'Otros' },
];

const CATEGORY_LABELS: Record<string, string> = {
  alimentacion:    'Alimentación',
  veterinaria:     'Veterinaria',
  infraestructura: 'Infraestructura',
  otros:           'Otros',
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

export default function AdminGastosPage() {
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [page, setPage]             = useState<PageInfo>({ currentPage: 1, lastPage: 1, total: 0 });
  const [currentPageNum, setCurrentPageNum] = useState(1);
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

  function fetchExpenses(pageNum: number = 1) {
    setLoading(true);
    return fetch(`${API}/admin/expenses?page=${pageNum}&per_page=10`, {
      headers: { Accept: 'application/json', ...authHeaders() },
    })
      .then(r => r.json())
      .then(data => {
        setExpenses(data.data ?? []);
        setPage(pageInfoFrom(data));
        setCurrentPageNum(pageNum);
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchExpenses(); }, []);

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

    const res = await fetch(`${API}/admin/expenses`, {
      method: 'POST',
      headers: { Accept: 'application/json', ...authHeaders() },
      body: fd,
    });

    if (res.ok) {
      setSuccess('Gasto registrado correctamente');
      setForm({
        description:  '',
        amount:       '',
        category:     'alimentacion',
        expense_date: new Date().toISOString().split('T')[0],
      });
      setFile(null);
      fetchExpenses(1);
    } else {
      const data = await res.json();
      setError(data.message ?? 'Error al registrar el gasto');
    }
    setSubmitting(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este gasto?')) return;
    await fetch(`${API}/admin/expenses/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', ...authHeaders() },
    });
    fetchExpenses(1);
  }

  return (
    <main className="px-6 py-10">
      <section className="mx-auto grid max-w-5xl gap-8">

        <div>
          <h1 className="text-4xl font-semibold text-slate-custom-900">Gastos del albergue</h1>
          <p className="mt-2 text-sm text-slate-custom-700">
            Registra los gastos del albergue y consulta el resumen financiero.
          </p>
        </div>

        {/* resumen */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Total gastos</p>
            <p className="mt-2 text-3xl font-semibold text-slate-custom-900">{money(totalGastos)}</p>
          </div>
          <div className="rounded-xl border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Gastos registrados</p>
            <p className="mt-2 text-3xl font-semibold text-slate-custom-900">{page.total}</p>
          </div>
        </div>

        {/* distribucion por categoria */}
        <div className="rounded-xl border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-custom-900">Distribución por categoría</h2>
          <div className="grid gap-3">
            {byCategory.map(cat => (
              <div key={cat.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-custom-900">{cat.label}</span>
                  <span className="font-semibold text-slate-custom-900">{money(cat.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-custom-50">
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
        <div className="rounded-xl border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-custom-900">Registrar nuevo gasto</h2>
          {success && (
            <p className="mb-3 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 border border-emerald-200">{success}</p>
          )}
          {error && (
            <p className="mb-3 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700 border border-rose-200">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">
                Descripción
              </label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Ej. compra de alimento para perros"
                required
                className="w-full rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 placeholder-slate-custom-600 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">
                Monto (S/.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 placeholder-slate-custom-600 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">
                Fecha del gasto
              </label>
              <input
                type="date"
                value={form.expense_date}
                onChange={e => setForm({ ...form, expense_date: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">
                Comprobante (opcional)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-custom-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1 file:text-xs file:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-brand-600 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? 'Registrando...' : 'Registrar gasto'}
              </button>
            </div>
          </form>
        </div>

        {/* lista de gastos */}
        <div className="rounded-xl border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-custom-900">Gastos registrados</h2>
          {loading ? (
            <p className="text-sm text-slate-custom-700">Cargando...</p>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-slate-custom-700">No hay gastos registrados aún</p>
          ) : (
            <>
              <div className="grid gap-3 mb-6">
                {expenses.map(expense => (
                  <article
                    key={expense.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-slate-custom-50 p-4 bg-slate-custom-50/30"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-custom-900">{expense.description}</p>
                      <p className="text-xs text-slate-custom-700 mt-1">
                        {CATEGORY_LABELS[expense.category] ?? expense.category}
                        {' · '}
                        {new Date(expense.expense_date).toLocaleDateString('es-PE')}
                      </p>
                      {expense.document_path && (
                        <a
                          href={`${STORAGE}/${expense.document_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Ver comprobante
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-semibold text-sm text-slate-custom-900">{money(expense.amount)}</p>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-xs text-rose-700 hover:text-rose-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {page.lastPage > 1 && (
                <Pagination
                  page={page}
                  buildHref={(pageNum) => `#page-${pageNum}`}
                  itemLabel="gastos"
                />
              )}
            </>
          )}
        </div>

      </section>
    </main>
  );
}
