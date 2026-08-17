"use client";

import { useEffect, useState } from "react";
import type { Donation, DonationStatus, PaginatedDonations } from "@/types/donation";
import { adminFetch } from "@/lib/adminAuth";
import { API_BASE_URL as API } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

const TABS: { key: DonationStatus; label: string; activeClass: string; badgeClass: string }[] = [
  { key: "pending",  label: "Pendientes", activeClass: "bg-rose-500 text-white",    badgeClass: "bg-rose-500/20 text-rose-700" },
  { key: "approved", label: "Aprobadas",  activeClass: "bg-emerald-500 text-white", badgeClass: "bg-emerald-500/20 text-emerald-700" },
  { key: "rejected", label: "Rechazadas", activeClass: "bg-slate-500 text-white",   badgeClass: "bg-slate-500/20 text-slate-custom-700" },
];

const METHOD_LABEL: Record<string, string> = { yape: "Yape", plin: "Plin", paypal: "PayPal", efectivo: "Efectivo" };

const REJECT_REASONS = [
  "CÃ³digo de operaciÃ³n invÃ¡lido",
  "Monto no coincide",
  "Comprobante ilegible",
  "Otros (especificar)",
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function quickRange(kind: "today" | "week" | "month") {
  const to = new Date();
  const from = new Date();
  if (kind === "today") from.setHours(0, 0, 0, 0);
  if (kind === "week") from.setDate(from.getDate() - 7);
  if (kind === "month") from.setMonth(from.getMonth() - 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export default function DonacionesPage() {
  const [status, setStatus] = useState<DonationStatus>("pending");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [counts, setCounts] = useState<Record<DonationStatus, number>>({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Donation | null>(null);

  function buildParams(includePagination = true) {
    const params = new URLSearchParams({ status });
    if (includePagination) params.set("per_page", "50");
    if (search.trim()) params.set("search", search.trim());
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    return params;
  }

  async function loadCounts() {
    const results = await Promise.all(
      TABS.map((t) => adminFetch(`${API}/admin/donations?status=${t.key}&per_page=1`).then((r) => r.json()).catch(() => ({ total: 0 })))
    );
    setCounts({
      pending: results[0]?.total ?? 0,
      approved: results[1]?.total ?? 0,
      rejected: results[2]?.total ?? 0,
    });
  }

  async function loadDonations() {
    setLoading(true);
    const params = buildParams();
    try {
      const res = await adminFetch(`${API}/admin/donations?${params.toString()}`, { cache: "no-store" });
      const body: PaginatedDonations = await res.json();
      setDonations(body.data ?? []);
    } catch {
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadCounts);
  }, []);
  useEffect(() => {
    const t = setTimeout(loadDonations, 300); // debounce bÃºsqueda
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, dateFrom, dateTo]);

  function applyQuickRange(kind: "today" | "week" | "month") {
    const { from, to } = quickRange(kind);
    setDateFrom(from);
    setDateTo(to);
  }

  function clearDateRange() {
    setDateFrom("");
    setDateTo("");
  }

  async function handleStatusUpdate(id: number, newStatus: DonationStatus, adminNotes?: string) {
    const res = await adminFetch(`${API}/admin/donations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, admin_notes: adminNotes ?? null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSelected(updated);
    }
    await Promise.all([loadDonations(), loadCounts()]);
  }

  async function exportCsv() {
    const params = buildParams(false);
    const res = await adminFetch(`${API}/admin/donations/export.csv?${params.toString()}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donaciones.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="px-6 py-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Admin</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-custom-900">Donaciones</h1>
        </div>
        <button onClick={exportCsv} className="w-fit rounded-full border border-brand-600/30 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-100">
          Descargar Reporte CSV
        </button>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                status === t.key ? t.activeClass : "border border-slate-custom-50 bg-cream-50 text-slate-custom-700 hover:bg-slate-custom-50"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${status === t.key ? "bg-black/20" : t.badgeClass}`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* BÃºsqueda + filtro de fechas */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-custom-50 bg-cream-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por donante, cÃ³digo de operaciÃ³n o monto..."
            className="w-full max-w-sm rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-2.5 text-sm text-slate-custom-900 placeholder-slate-custom-400 outline-none focus:border-brand-600"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => applyQuickRange("today")} className="rounded-full border border-slate-custom-50 bg-cream-100 px-3 py-1.5 text-xs text-slate-custom-700 hover:bg-slate-custom-50">Hoy</button>
            <button onClick={() => applyQuickRange("week")} className="rounded-full border border-slate-custom-50 bg-cream-100 px-3 py-1.5 text-xs text-slate-custom-700 hover:bg-slate-custom-50">Ãšltima semana</button>
            <button onClick={() => applyQuickRange("month")} className="rounded-full border border-slate-custom-50 bg-cream-100 px-3 py-1.5 text-xs text-slate-custom-700 hover:bg-slate-custom-50">Ãšltimo mes</button>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border border-slate-custom-50 bg-cream-100 px-3 py-1.5 text-xs text-slate-custom-700 outline-none focus:border-brand-600" />
            <span className="text-xs text-slate-custom-400">a</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border border-slate-custom-50 bg-cream-100 px-3 py-1.5 text-xs text-slate-custom-700 outline-none focus:border-brand-600" />
            {(dateFrom || dateTo) && (
              <button onClick={clearDateRange} className="text-xs text-rose-600 hover:underline">Limpiar</button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-3xl border border-slate-custom-50 bg-cream-50 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-custom-50 text-xs uppercase tracking-wider text-slate-custom-400">
                <th className="px-5 py-3">Donante</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">MÃ©todo</th>
                <th className="px-5 py-3">Referencia</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-custom-400">Cargando...</td></tr>
              )}
              {!loading && donations.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-custom-400">No hay donaciones para este filtro.</td></tr>
              )}
              {!loading && donations.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="cursor-pointer border-b border-slate-custom-50 transition hover:bg-slate-custom-50/50"
                >
                  <td className="px-5 py-3 font-medium text-slate-custom-900">{d.donor_name || "AnÃ³nimo"}</td>
                  <td className="px-5 py-3 text-slate-custom-700">S/. {Number(d.amount ?? 0).toFixed(2)}</td>
                  <td className="px-5 py-3 text-slate-custom-700">{METHOD_LABEL[d.payment_method] ?? d.payment_method}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-custom-400">{d.operation_reference || "â€”"}</td>
                  <td className="px-5 py-3">
                    {d.donation_type === "specific" ? (
                      <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs text-amber-700">Apadrinamiento</span>
                    ) : (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">General</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-custom-400">{fmtDate(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <DonationModal
          donation={selected}
          onClose={() => setSelected(null)}
          onApprove={() => handleStatusUpdate(selected.id, "approved")}
          onReject={(reason) => handleStatusUpdate(selected.id, "rejected", reason)}
        />
      )}
    </main>
  );
}

// â”€â”€ Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DonationModal({
  donation, onClose, onApprove, onReject,
}: {
  donation: Donation;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [zoom, setZoom] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  const voucherUrl = donation.voucher_path ? `${mediaUrl(donation.voucher_path)}` : null;
  const finalReason = reason === "Otros (especificar)" ? customReason.trim() : reason;

  function handleApprove() {
    onApprove();
    setConfirmMsg("DonaciÃ³n aprobada");
  }

  function handleReject() {
    if (!finalReason) return;
    onReject(finalReason);
  }

   return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-2xl"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-600">Detalle de donaciÃ³n</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-custom-900">{donation.donor_name || "Donante anÃ³nimo"}</h2>
            </div>
            <button onClick={onClose} className="text-slate-custom-400 hover:text-slate-custom-700">âœ•</button>
          </div>

          {confirmMsg && (
            <p className="mb-4 rounded-xl border border-emerald-300/30 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {confirmMsg}
            </p>
          )}

          <div className="grid gap-3 rounded-2xl border border-slate-custom-50 bg-cream-100 p-5 text-sm">
            <Row label="Email" value={donation.donor_email || "â€”"} />
            <Row label="Monto" value={`S/. ${Number(donation.amount ?? 0).toFixed(2)}`} />
            <Row label="MÃ©todo" value={METHOD_LABEL[donation.payment_method] ?? donation.payment_method} />
            <Row label="Referencia" value={donation.operation_reference || "â€”"} />
            <Row label="Fecha" value={fmtDate(donation.created_at)} />
            <Row label="Tipo" value={donation.donation_type === "specific" ? "Apadrinamiento" : "DonaciÃ³n general"} />
            <Row label="Recurrente" value={donation.is_recurring ? "SÃ­" : "No"} />
            <Row label="AnÃ³nimo" value={donation.is_anonymous ? "SÃ­" : "No"} />
            {donation.donation_type === "specific" && donation.animal && (
              <Row label="Animal apadrinado" value={donation.animal.name} />
            )}
            {donation.notes && <Row label="Notas del donante" value={donation.notes} />}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-slate-custom-400">Comprobante</p>
            {voucherUrl && !imgError ? (
              <div className="space-y-3">
                <img
                  src={voucherUrl}
                  alt="Comprobante"
                  onError={() => setImgError(true)}
                  onClick={() => setZoom(true)}
                  className="max-h-72 w-full cursor-zoom-in rounded-2xl border border-slate-custom-50 object-contain bg-black"
                />
                <a
                  href={voucherUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-slate-custom-50 px-4 py-2 text-xs font-medium text-slate-custom-700 hover:bg-slate-custom-50"
                >
                  Descargar imagen
                </a>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-custom-50 bg-cream-100 px-4 py-6 text-center text-sm text-slate-custom-400">
                No se pudo cargar el comprobante.
              </p>
            )}
          </div>

          {donation.status === "pending" && !showReject && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleApprove}
                className="flex-1 rounded-full bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-400 transition"
              >
                âœ“ Aprobar DonaciÃ³n
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex-1 rounded-full bg-rose-500 py-3 text-sm font-bold text-white hover:bg-rose-400 transition"
              >
                âœ• Rechazar DonaciÃ³n
              </button>
            </div>
          )}

          {showReject && (
            <div className="mt-6 rounded-2xl border border-rose-300/30 bg-rose-50 p-5">
              <p className="mb-3 text-sm font-semibold text-rose-700">Motivo del rechazo</p>
              <div className="flex flex-col gap-2">
                {REJECT_REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm text-slate-custom-700">
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                    {r}
                  </label>
                ))}
              </div>
              {reason === "Otros (especificar)" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Especifica el motivo..."
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-2.5 text-sm text-slate-custom-900 outline-none focus:border-rose-400"
                />
              )}
              <div className="mt-4 flex gap-3">
                <button onClick={() => setShowReject(false)} className="flex-1 rounded-full border border-slate-custom-50 py-2.5 text-sm text-slate-custom-700 hover:bg-slate-custom-50">
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={!finalReason}
                  className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-40 transition"
                >
                  Confirmar rechazo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {zoom && voucherUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6" onClick={() => setZoom(false)}>
          <img src={voucherUrl} alt="Comprobante ampliado" className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs uppercase tracking-wider text-slate-custom-400">{label}</span>
      <span className="text-right text-slate-custom-700">{value}</span>
    </div>
  );
}



