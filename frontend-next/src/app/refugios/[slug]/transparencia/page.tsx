"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

type Transparency = {
  shelter: { name: string; slug: string; description: string | null };
  summary: { total_income: number; total_expenses: number; balance: number };
  expense_categories: Record<string, number>;
  donations: { data: { id: number; donor_name: string; amount: string | number; donation_type: string; is_recurring: boolean; created_at: string }[] };
  expenses: { data: { id: number; description: string; amount: string | number; category: string; document_path: string; expense_date: string }[] };
};

const CATEGORY_LABELS: Record<string, string> = {
  alimentacion: "Alimentación",
  veterinaria: "Veterinaria",
  infraestructura: "Infraestructura",
  otros: "Otros",
};

function money(value: string | number) {
  return `S/. ${Number(value ?? 0).toFixed(2)}`;
}

export default function ShelterTransparencyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<Transparency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/public/shelters/${slug}/transparency`, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar la transparencia.");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Error inesperado."))
      .finally(() => setLoading(false));
  }, [slug]);

  const maxCategory = useMemo(() => Math.max(1, ...Object.values(data?.expense_categories ?? {})), [data]);

  if (loading) return <main className="min-h-screen bg-cream-100 px-5 py-12 text-slate-custom-700">Cargando transparencia...</main>;
  if (error || !data) return <main className="min-h-screen bg-cream-100 px-5 py-12 text-rose-700">{error || "No encontrado."}</main>;

  return (
    <main className="min-h-screen bg-cream-100 text-slate-custom-900">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10">
        <div className="flex flex-col gap-3 border-b border-slate-custom-50 pb-6">
          <Link href="/transparencia" className="text-sm font-semibold text-brand-600">Volver a transparencia global</Link>
          <h1 className="text-3xl font-semibold sm:text-5xl">Transparencia de {data.shelter.name}</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-custom-700">{data.shelter.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Total ingresos" value={money(data.summary.total_income)} />
          <Metric label="Total gastos" value={money(data.summary.total_expenses)} />
          <Metric label="Balance" value={money(data.summary.balance)} />
        </div>

        <section className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Distribución de gastos</h2>
          <div className="mt-5 grid gap-3">
            {Object.entries(data.expense_categories).map(([key, value]) => (
              <div key={key} className="grid gap-1">
                <div className="flex justify-between text-sm">
                  <span>{CATEGORY_LABELS[key] ?? key}</span>
                  <span className="font-semibold">{money(value)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.max(3, (Number(value) / maxCategory) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Donaciones aprobadas</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Donante</th><th>Monto</th><th>Tipo</th><th>Fecha</th></tr></thead>
                <tbody>
                  {data.donations.data.map((d) => (
                    <tr key={d.id} className="border-t border-slate-100">
                      <td className="py-2">{d.donor_name}</td>
                      <td>{money(d.amount)}</td>
                      <td>{d.donation_type === "specific" ? "Apadrinamiento" : "General"}{d.is_recurring ? " mensual" : ""}</td>
                      <td>{new Date(d.created_at).toLocaleDateString("es-PE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Gastos aprobados</h2>
            <div className="mt-4 grid gap-3">
              {data.expenses.data.map((expense) => (
                <article key={expense.id} className="rounded-md border border-slate-100 p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-xs text-slate-500">{CATEGORY_LABELS[expense.category] ?? expense.category} · {new Date(expense.expense_date).toLocaleDateString("es-PE")}</p>
                    </div>
                    <p className="font-semibold">{money(expense.amount)}</p>
                  </div>
                  {expense.document_path && <a href={`${STORAGE}/${expense.document_path}`} className="mt-2 inline-block text-xs font-semibold text-brand-600" download>Descargar comprobante</a>}
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-custom-50 bg-cream-50 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
