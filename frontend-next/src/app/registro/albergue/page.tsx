"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SimplePage } from "@/lib/SimpleViews";
import { registerShelter } from "@/lib/api";

export default function RegisterShelterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    shelter_name: "",
    responsible_name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    password: "",
    password_confirmation: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordIsValid =
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /[0-9]/.test(form.password) &&
    /[^A-Za-z0-9]/.test(form.password);

  function updateField(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!passwordIsValid) {
      setError("La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.");
      return;
    }

    if (form.password !== form.password_confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await registerShelter(form);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SimplePage title="Registro de albergue" description="Todos los campos son obligatorios. El albergue quedará en revisión hasta que el super admin lo apruebe.">
      <form onSubmit={submit} className="grid max-w-2xl gap-4 rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
        <Field name="shelter_name" label="Nombre del albergue" value={form.shelter_name} onChange={updateField} />
        <Field name="responsible_name" label="Responsable" value={form.responsible_name} onChange={updateField} />
        <Field name="email" label="Correo" value={form.email} onChange={updateField} type="email" />
        <Field name="phone" label="Teléfono" value={form.phone} onChange={updateField} />
        <Field name="address" label="Dirección" value={form.address} onChange={updateField} />

        <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
          Descripción y evidencia de actividad
          <textarea
            required
            name="description"
            value={form.description}
            onChange={updateField}
            rows={5}
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            placeholder="Describe el trabajo del albergue, zona de atención y evidencia verificable."
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="password" label="Contraseña" value={form.password} onChange={updateField} type={showPasswords ? "text" : "password"} />
          <Field name="password_confirmation" label="Repetir contraseña" value={form.password_confirmation} onChange={updateField} type={showPasswords ? "text" : "password"} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-sm ${passwordIsValid ? "text-brand-600" : "text-slate-custom-700"}`}>
            La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.
          </p>
          <button type="button" onClick={() => setShowPasswords((value) => !value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-custom-700 hover:bg-cream-100">
            {showPasswords ? "Ocultar" : "Ver"} contraseña
          </button>
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button disabled={loading} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Enviando..." : "Enviar a revisión"}
        </button>
      </form>
    </SimplePage>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  type = "text",
}: {
  name: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
      {label}
      <input
        required
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="rounded-md border border-slate-300 px-3 py-2 font-normal"
        placeholder={label}
      />
    </label>
  );
}
