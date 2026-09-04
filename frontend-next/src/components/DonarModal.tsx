"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getStoredToken, API_BASE_URL as API } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { Spinner } from "@/components/Spinner";

type PaymentMethod = { enabled: boolean; phone: string | null; owner: string | null; qr_path: string | null };

type ShelterDonationInfo = {
  id: number;
  name: string;
  slug: string;
  logo_path: string | null;
  accepts_donations: boolean;
  payment_methods: { yape: PaymentMethod; plin: PaymentMethod };
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function DonarModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [shelter, setShelter] = useState<ShelterDonationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getStoredToken()));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API}/public/shelters/${slug}`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar la información del albergue.");
        return r.json();
      })
      .then(setShelter)
      .catch(() => setError("No se pudo cargar la información del albergue."))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const yape = shelter?.payment_methods.yape;
  const plin = shelter?.payment_methods.plin;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Fila 1: nombre del albergue */}
          <h3 className="text-lg font-semibold text-slate-900">
            {loading ? "Cargando..." : shelter?.name ?? "Albergue"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon />
          </button>
        </div>

        {loading && <div className="mt-4 flex justify-center"><Spinner size="sm" /></div>}
        {!loading && error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        {!loading && !error && shelter && (
          <div className="mt-4 space-y-4">
            {/* Fila 2: QR Yape */}
            {yape?.enabled && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Yape</p>
                {yape.qr_path && (
                  <div className="relative mx-auto mt-2 h-40 w-40">
                    <Image src={mediaUrl(yape.qr_path)} alt="QR Yape" fill sizes="160px" className="object-contain" />
                  </div>
                )}
                <p className="mt-2 text-sm font-semibold text-slate-800">{yape.phone}</p>
                <p className="text-xs text-slate-500">Titular: {yape.owner}</p>
              </div>
            )}

            {/* Fila 3: cuenta Plin, si tiene */}
            {plin?.enabled && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Plin</p>
                {plin.qr_path && (
                  <div className="relative mx-auto mt-2 h-40 w-40">
                    <Image src={mediaUrl(plin.qr_path)} alt="QR Plin" fill sizes="160px" className="object-contain" />
                  </div>
                )}
                <p className="mt-2 text-sm font-semibold text-slate-800">{plin.phone}</p>
                <p className="text-xs text-slate-500">Titular: {plin.owner}</p>
              </div>
            )}

            {!yape?.enabled && !plin?.enabled && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Este albergue aún no configuró un método de donación.
              </p>
            )}

            {/* Fila 4: registro / login */}
            {!isLoggedIn ? (
              <div className="rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-sm text-slate-700">Para registrar tu donación necesitas iniciar sesión.</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/registro"
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Crear cuenta
                  </Link>
                  <Link
                    href="/login"
                    className="flex-1 rounded-md bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Iniciar sesión para donar
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 p-4 text-center text-sm text-slate-700">
                Ya iniciaste sesión. Escanea el código, realiza tu pago y comparte tu comprobante con el albergue.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
