"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createAdoption, friendlyErrorMessage, getStoredUser, type AuthUser } from "@/lib/api";

type Props = { animalId: number; shelterId: number };

type FormState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success" }
  | { phase: "error"; message: string };

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function AdoptionForm({ animalId, shelterId }: Props) {
  const pathname = usePathname();
  const [form, setForm] = useState({ applicant_name: "", dni: "", phone: "", address: "", notes: "" });
  const [state, setState] = useState<FormState>({ phase: "idle" });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setCheckedAuth(true);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ phase: "loading" });
    try {
      await createAdoption({ shelter_id: shelterId, animal_id: animalId, ...form });
      setState({ phase: "success" });
    } catch (err) {
      setState({ phase: "error", message: friendlyErrorMessage(err, "No se pudo enviar tu postulación. Inténtalo de nuevo.") });
    }
  }

  if (!checkedAuth) {
    return <div className="h-40 animate-pulse rounded-2xl border border-slate-custom-50 bg-cream-50" />;
  }

  if (!user || user.role !== "natural_person") {
    return (
      <div className="rounded-2xl border border-slate-custom-50 bg-white p-6 text-center">
        <p className="text-sm text-slate-custom-700">Necesitas iniciar sesión como persona natural para postular a esta adopción.</p>
        <Link
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (state.phase === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-emerald-700">¡Postulación enviada!</h3>
        <p className="mt-2 text-sm text-slate-custom-700">El refugio revisará tu solicitud y se pondrá en contacto contigo.</p>
      </div>
    );
  }

  const isLoading = state.phase === "loading";

  return (
    <div className="rounded-2xl border border-slate-custom-50 bg-white p-6">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-brand-600">Postular adopción</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="applicant_name" className="text-sm font-medium text-slate-custom-700">
            Nombre completo <span className="text-rose-500">*</span>
          </label>
          <input
            id="applicant_name" name="applicant_name" required value={form.applicant_name} onChange={handleChange}
            placeholder="Ana García López"
            className="rounded-xl border border-slate-custom-50 bg-cream-50 px-4 py-2.5 text-sm text-slate-custom-900 placeholder-slate-400 outline-none transition focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dni" className="text-sm font-medium text-slate-custom-700">DNI <span className="text-rose-500">*</span></label>
            <input
              id="dni" name="dni" required maxLength={8} inputMode="numeric" pattern="\d{8}" value={form.dni} onChange={handleChange}
              placeholder="12345678"
              className="rounded-xl border border-slate-custom-50 bg-cream-50 px-4 py-2.5 text-sm text-slate-custom-900 placeholder-slate-400 outline-none transition focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-slate-custom-700">Teléfono <span className="text-rose-500">*</span></label>
            <input
              id="phone" name="phone" required maxLength={9} inputMode="numeric" pattern="\d{9}" value={form.phone} onChange={handleChange}
              placeholder="987654321"
              className="rounded-xl border border-slate-custom-50 bg-cream-50 px-4 py-2.5 text-sm text-slate-custom-900 placeholder-slate-400 outline-none transition focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className="text-sm font-medium text-slate-custom-700">Dirección <span className="text-rose-500">*</span></label>
          <input
            id="address" name="address" required value={form.address} onChange={handleChange}
            placeholder="Av. Los Olivos 123, Lima"
            className="rounded-xl border border-slate-custom-50 bg-cream-50 px-4 py-2.5 text-sm text-slate-custom-900 placeholder-slate-400 outline-none transition focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-slate-custom-700">
            ¿Por qué quieres adoptar a este animal? <span className="text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange}
            placeholder="Cuéntanos un poco sobre ti y tu hogar..."
            className="resize-none rounded-xl border border-slate-custom-50 bg-cream-50 px-4 py-2.5 text-sm text-slate-custom-900 placeholder-slate-400 outline-none transition focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/10"
          />
        </div>

        {state.phase === "error" && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p>
        )}

        <button
          type="submit" disabled={isLoading}
          className="mt-1 rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enviando..." : "Enviar postulación"}
        </button>
      </form>
    </div>
  );
}