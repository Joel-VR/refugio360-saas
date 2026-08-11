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

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-lg text-sm font-medium transition-all ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
    }`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

function DeleteModal({ expense, onConfirm, onCancel }: {
  expense: Expense;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">¿Eliminar este gasto?</h3>
        <p className="text-sm text-slate-500 mb-4">Esta acción no se puede deshacer.</p>
        <div className="rounded-lg bg-slate-50 p-3 mb-4 text-sm">
          <p className="font-semibold text-slate-800">{expense.description}</p>
          <p className="text-slate-500 mt-1">{CATEGORY_LABELS[expense.category]} · {money(expense.amount)}</p>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Motivo de eliminación <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="ej. gasto duplicado, error en el monto..."
            rows={3}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim()}
            className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-40"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ expense, onConfirm, onCancel }: {
  expense: Expense;
  onConfirm: (data: Partial<Expense>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    description:  expense.description,
    amount:       expense.amount,
    category:     expense.category,
    expense_date: expense.expense_date.split('T')[0],
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Editar gasto</h3>
        <div className="grid gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Monto (S/.)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Fecha del gasto</label>
            <input
              type="date"
              value={form.expense_date}
              onChange={e => setForm({ ...form, expense_date: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(form)}
            className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-bold text-white hover:bg-brand-700 transition"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGastosPage() {
  const [expenses, setExpenses]         = useState<Expense[]>([]);
  const [page, setPage]                 = useState<PageInfo>({ currentPage: 1, lastPage: 1, total: 0 });
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [toast, setToast]               = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [editTarget, setEditTarget]     = useState<Expense | null>(null);

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
    total: expenses.filter(e => e.category === cat.value).reduce((acc, e) => acc + Number(e.amount), 0),
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
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchExpenses(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

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
      setToast({ message: 'Gasto registrado correctamente', type: 'success' });
      setForm({ description: '', amount: '', category: 'alimentacion', expense_date: new Date().toISOString().split('T')[0] });
      setFile(null);
      fetchExpenses(1);
    } else {
      const data = await res.json();
      setToast({ message: data.message ?? 'Error al registrar el gasto', type: 'error' });
    }
    setSubmitting(false);
  }

  async function handleDeleteConfirm(reason: string) {
    if (!deleteTarget) return;
    await fetch(`${API}/admin/expenses/${deleteTarget.id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', ...authHeaders() },
    });
    setToast({ message: `Gasto eliminado: ${reason}`, type: 'success' });
    setDeleteTarget(null);
    fetchExpenses(currentPageNum);
  }

  async function handleEditConfirm(data: Partial<Expense>) {
    if (!editTarget) return;
    const res = await fetch(`${API}/admin/expenses/${editTarget.id}`, {
      method: 'PUT',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setToast({ message: 'Gasto actualizado correctamente', type: 'success' });
      fetchExpenses(currentPageNum);
    } else {
      setToast({ message: 'Error al actualizar el gasto', type: 'error' });
    }
    setEditTarget(null);
  }

  return (
    <main className="px-6 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <DeleteModal
          expense={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {editTarget && (
        <EditModal
          expense={editTarget}
          onConfirm={handleEditConfirm}
          onCancel={() => setEditTarget(null)}
        />
      )}

      <section className="mx-auto grid max-w-5xl gap-8">
        <div>
          <h1 className="text-4xl font-semibold text-slate-custom-900">Gastos del albergue</h1>
          <p className="mt-2 text-sm text-slate-custom-700">Registra los gastos del albergue y consulta el resumen financiero.</p>
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
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.max(2, (cat.total / maxCat) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* formulario nuevo gasto */}
        <div className="rounded-xl border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-custom-900">Registrar nuevo gasto</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">Descripción</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ej. compra de alimento para perros" required className="w-full rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 placeholder-slate-custom-600 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">Monto (S/.)</label>
              <input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="w-full rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">Categoría</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 focus:outline-none focus:ring-2 focus:ring-brand-600">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">Fecha del gasto</label>
              <input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required className="w-full rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2 text-sm text-slate-custom-900 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-custom-700">Comprobante (opcional)</label>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm text-slate-custom-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1 file:text-xs file:text-white" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={submitting} className="w-full rounded-xl bg-brand-600 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
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
                  <article key={expense.id} className="flex items-start justify-between gap-4 rounded-lg border border-slate-custom-50 p-4 bg-slate-custom-50/30">
                    <div>
                      <p className="font-semibold text-sm text-slate-custom-900">{expense.description}</p>
                      <p className="text-xs text-slate-custom-700 mt-1">
                        {CATEGORY_LABELS[expense.category] ?? expense.category}{' · '}{new Date(expense.expense_date).toLocaleDateString('es-PE')}
                      </p>
                      {expense.document_path && (
                        <a href={`${STORAGE}/${expense.document_path}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700">
                          Ver comprobante
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-semibold text-sm text-slate-custom-900">{money(expense.amount)}</p>
                      <div className="flex gap-3">
                        <button onClick={() => setEditTarget(expense)} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                          Editar
                        </button>
                        <button onClick={() => setDeleteTarget(expense)} className="text-xs text-rose-700 hover:text-rose-800 font-medium">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {page.lastPage > 1 && (
                <Pagination page={page} buildHref={(pageNum) => `#page-${pageNum}`} itemLabel="gastos" />
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}