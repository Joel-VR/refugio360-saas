"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { friendlyErrorMessage, getMyDonations } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Donation } from "@/types/donation";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "border-amber-300 bg-amber-50 text-amber-700" },
  approved: { label: "Aprobado", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rechazado", className: "border-rose-300 bg-rose-50 text-rose-700" },
};

function GiftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v9H4v-9M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}

export default function AccountDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyDonations()
      .then(setDonations)
      .catch((err) => setError(friendlyErrorMessage(err, "No se pudieron cargar tus donaciones.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Mis donaciones</h1>
        <Link
          href="/refugios"
          className="inline-flex w-fit items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <GiftIcon />
          Nueva donaciÃ³n
        </Link>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading && (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-slate-custom-50 bg-cream-50" />
          ))}
        </div>
      )}

      {!loading && donations.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-custom-50 bg-cream-50 p-8 text-center">
          <p className="text-sm text-slate-custom-700">TodavÃ­a no has hecho ninguna donaciÃ³n.</p>
          <Link
            href="/refugios"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <GiftIcon />
            Elegir un refugio para donar
          </Link>
        </div>
      )}

      {!loading && donations.length > 0 && (
        <div className="grid gap-3">
          {donations.map((donation) => {
            const badge = STATUS_BADGE[donation.status] ?? { label: donation.status, className: "border-slate-300 bg-slate-100 text-slate-600" };
            return (
              <article key={donation.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-custom-50 bg-cream-50 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">S/. {Number(donation.amount ?? 0).toFixed(2)} Â· {donation.shelter?.name ?? `Albergue #${donation.shelter_id}`}</p>
                  <p className="mt-1 text-sm text-slate-custom-700">
                    {donation.payment_method.toUpperCase()} Â· {new Date(donation.created_at).toLocaleDateString("es-PE")}
                    {donation.animal ? ` Â· Apadrinando a ${donation.animal.name}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                  {donation.voucher_path && (
                    <a href={`${mediaUrl(donation.voucher_path)}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-600 underline">
                      Ver comprobante
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}


