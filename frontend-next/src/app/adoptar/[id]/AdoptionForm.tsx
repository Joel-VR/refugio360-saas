"use client";

import { useState } from "react";
import { createAdoption } from "@/lib/api";

type Props = {
  animalId: number;
  shelterId: number;
};

type FormState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success" }
  | { phase: "error"; message: string };

export default function AdoptionForm({ animalId, shelterId }: Props) {
  const [form, setForm] = useState({
    applicant_name: "",
    dni: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [state, setState] = useState<FormState>({ phase: "idle" });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ phase: "loading" });

    try {
      await createAdoption({
        shelter_id: shelterId,
        animal_id: animalId,
        ...form,
      });
      setState({ phase: "success" });
    } catch (err) {
      setState({
        phase: "error",
        message:
          err instanceof Error
            ? err.message
            : "Ocurrió un error. Inténtalo de nuevo.",
      });
    }
  }

  if (state.phase === "success") {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-8 text-center">
        <p className="text-3xl">🐾</p>
        <h3 className="mt-4 text-lg font-semibold text-emerald-300">
          ¡Postulación enviada!
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          El refugio revisará tu solicitud y se pondrá en contacto contigo.
        </p>
      </div>
    );
  }

  const isLoading = state.phase === "loading";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-custom-900/60 p-6">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Postular adopción
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* nombre */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="applicant_name" className="text-sm text-slate-300">
            Nombre completo <span className="text-rose-400">*</span>
          </label>
          <input
            id="applicant_name"
            name="applicant_name"
            required
            value={form.applicant_name}
            onChange={handleChange}
            placeholder="Ana García López"
            className="rounded-xl border border-white/10 bg-cream-50/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-custom-400 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* DNI */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dni" className="text-sm text-slate-300">
              DNI <span className="text-rose-400">*</span>
            </label>
            <input
              id="dni"
              name="dni"
              required
              maxLength={8}
              inputMode="numeric"
              pattern="\d{8}"
              value={form.dni}
              onChange={handleChange}
              placeholder="12345678"
              className="rounded-xl border border-white/10 bg-cream-50/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-custom-400 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition"
            />
          </div>

          {/* teléfono */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm text-slate-300">
              Teléfono <span className="text-rose-400">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              required
              maxLength={9}
              inputMode="numeric"
              pattern="\d{9}"
              value={form.phone}
              onChange={handleChange}
              placeholder="987654321"
              className="rounded-xl border border-white/10 bg-cream-50/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-custom-400 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition"
            />
          </div>
        </div>

        {/* dirección */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className="text-sm text-slate-300">
            Dirección <span className="text-rose-400">*</span>
          </label>
          <input
            id="address"
            name="address"
            required
            value={form.address}
            onChange={handleChange}
            placeholder="Av. Los Olivos 123, Lima"
            className="rounded-xl border border-white/10 bg-cream-50/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-custom-400 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition"
          />
        </div>

        {/* notas */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm text-slate-300">
            ¿Por qué quieres adoptar a este animal?{" "}
            <span className="text-slate-500">(opcional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            placeholder="Cuéntanos un poco sobre ti y tu hogar..."
            className="resize-none rounded-xl border border-white/10 bg-cream-50/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-custom-400 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition"
          />
        </div>

        {/* error */}
        {state.phase === "error" && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 rounded-full bg-cyan-400 py-3 text-sm font-semibold text-slate-custom-900 transition hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Enviando…" : "Enviar postulación"}
        </button>
      </form>
    </div>
  );
}