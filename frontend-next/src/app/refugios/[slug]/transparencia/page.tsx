"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";
import { API_BASE_URL as API } from "@/lib/api";

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
  return `S/. ${Number(value ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  back: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18",
  coin: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM12 6v12M9 9.5c0-1.38 1.343-2.5 3-2.5s3 1.12 3 2.5-1.343 2.5-3 2.5-3 1.12-3 2.5 1.343 2.5 3 2.5 3-1.12 3-2.5",
  receipt: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
  gift: "M20 12v9H4v-9M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
};

export default function ShelterTransparencyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<Transparency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/public/shelters/${slug}/transparency`, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar la información de transparencia.");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Error inesperado."))
      .finally(() => setLoading(false));
  }, [slug]);

  const maxCategory = useMemo(() => Math.max(1, ...Object.values(data?.expense_categories ?? {})), [data]);

  if (loading) {
    return (
      <SimplePage title="Transparencia" description="Cargando informe financiero...">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-28 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
            <div className="h-28 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
            <div className="h-28 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
          </div>
          <div className="h-48 animate-pulse rounded-2xl border border-slate-custom-50 bg-white" />
        </div>
      </SimplePage>
    );
  }

  if (error || !data) {
    return (
      <SimplePage title="Transparencia" description="Reporte público de refugio.">
        <div className="space-y-4">
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
          >
            <Icon path={ICONS.back} className="h-4 w-4" />
            Volver a transparencia global
          </Link>
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error || "No encontramos información para este refugio."}
          </p>
        </div>
      </SimplePage>
    );
  }

  return (
    <SimplePage
      title={`Transparencia de ${data.shelter.name}`}
      description={data.shelter.description || "Consulta ingresos aprobados, gastos registrados y balance detallado."}
    >
      <div className="-mt-2 space-y-6 text-slate-custom-900">
        {/* Botón Volver */}
        <div>
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
          >
            <Icon path={ICONS.back} className="h-4 w-4" />
            Volver a transparencia global
          </Link>
        </div>

        {/* Métricas Principales */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Total ingresos"
            value={money(data.summary.total_income)}
            badgeBg="bg-emerald-100 text-emerald-700"
            valueColor="text-emerald-700"
            icon={ICONS.coin}
          />
          <MetricCard
            label="Total gastos"
            value={money(data.summary.total_expenses)}
            badgeBg="bg-rose-100 text-rose-700"
            valueColor="text-rose-700"
            icon={ICONS.receipt}
          />
          <MetricCard
            label="Balance disponible"
            value={money(data.summary.balance)}
            badgeBg="bg-brand-600/10 text-brand-600"
            valueColor="text-brand-600"
            icon={ICONS.coin}
          />
        </div>

        {/* Distribución de Gastos */}
        <div className="rounded-2xl border border-slate-custom-50 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Categorías</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-custom-900">Distribución de gastos</h2>

          <div className="mt-6 grid gap-4">
            {Object.entries(data.expense_categories).map(([key, value]) => {
              const percentage = Math.round((Number(value) / maxCategory) * 100);
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-custom-900">{CATEGORY_LABELS[key] ?? key}</span>
                    <span className="font-semibold text-slate-custom-700">{money(value)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-cream-100">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all duration-500"
                      style={{ width: `${Math.max(4, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tablas Detalladas: Donaciones & Gastos */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Donaciones Aprobadas */}
          <div className="rounded-2xl border border-slate-custom-50 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Icon path={ICONS.gift} className="h-4.5 w-4.5" />
              </span>
              <h2 className="text-lg font-semibold text-slate-custom-900">Donaciones aprobadas</h2>
            </div>

            {data.donations.data.length === 0 ? (
              <p className="mt-6 text-xs text-slate-custom-700">No hay donaciones registradas aún.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-custom-700">
                      <th className="pb-3">Donante</th>
                      <th className="pb-3">Monto</th>
                      <th className="pb-3">Tipo</th>
                      <th className="pb-3 text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.donations.data.map((d) => (
                      <tr key={d.id} className="text-slate-custom-900">
                        <td className="py-3 font-medium">{d.donor_name}</td>
                        <td className="py-3 font-semibold text-emerald-700">{money(d.amount)}</td>
                        <td className="py-3">
                          <span className="inline-block rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-medium text-slate-custom-700">
                            {d.donation_type === "specific" ? "Apadrinamiento" : "General"}
                            {d.is_recurring ? " (mensual)" : ""}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-custom-700">
                          {new Date(d.created_at).toLocaleDateString("es-PE")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Gastos Aprobados */}
          <div className="rounded-2xl border border-slate-custom-50 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <Icon path={ICONS.receipt} className="h-4.5 w-4.5" />
              </span>
              <h2 className="text-lg font-semibold text-slate-custom-900">Gastos aprobados</h2>
            </div>

            {data.expenses.data.length === 0 ? (
              <p className="mt-6 text-xs text-slate-custom-700">No hay gastos registrados aún.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {data.expenses.data.map((expense) => (
                  <article
                    key={expense.id}
                    className="rounded-2xl border border-slate-custom-50 bg-cream-50 p-4"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-custom-900">{expense.description}</p>
                        <p className="mt-0.5 text-[11px] text-slate-custom-700">
                          {CATEGORY_LABELS[expense.category] ?? expense.category} ·{" "}
                          {new Date(expense.expense_date).toLocaleDateString("es-PE")}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-rose-700">{money(expense.amount)}</p>
                    </div>

                    {expense.document_path && (
                      <a
                        href={`${STORAGE}/${expense.document_path}`}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-600 transition hover:border-brand-600/40"
                        download
                      >
                        <Icon path={ICONS.download} className="h-3.5 w-3.5" />
                        Descargar comprobante
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimplePage>
  );
}

function MetricCard({
  label,
  value,
  badgeBg,
  valueColor,
  icon,
}: {
  label: string;
  value: string;
  badgeBg: string;
  valueColor: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-custom-50 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-custom-700">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${badgeBg}`}>
          <Icon path={icon} className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className={`mt-3 text-2xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}