"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SimplePage } from "@/lib/SimpleViews";
import { registerPerson } from "@/lib/api";

export default function RegisterPersonPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordIsValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!passwordIsValid) {
      setError("La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await registerPerson({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SimplePage title="Registro de persona natural" description="Todos los campos son obligatorios.">
      <form onSubmit={handleSubmit} className="grid max-w-lg gap-3 rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
        <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
          Nombre
          <input
            required
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            autoComplete="name"
            placeholder="Nombre completo"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
          Correo
          <input
            required
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            autoComplete="email"
            inputMode="email"
            placeholder="correo@ejemplo.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <PasswordField
          label="Contraseña"
          value={password}
          autoComplete="new-password"
          show={showPassword}
          onChange={setPassword}
          onToggle={() => setShowPassword((value) => !value)}
        />

        <PasswordField
          label="Repetir contraseña"
          value={passwordConfirmation}
          autoComplete="new-password"
          show={showPasswordConfirmation}
          onChange={setPasswordConfirmation}
          onToggle={() => setShowPasswordConfirmation((value) => !value)}
        />

        <p className={`text-sm ${passwordIsValid ? "text-brand-600" : "text-slate-custom-700"}`}>
          La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.
        </p>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button disabled={loading} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </SimplePage>
  );
}

function PasswordField({
  label,
  value,
  autoComplete,
  show,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  autoComplete: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
      {label}
      <span className="relative">
        <input
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 pr-11 font-normal"
          autoComplete={autoComplete}
          placeholder={label}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-label={show ? "Ocultar contraseña" : "Ver contraseña"}
          title={show ? "Ocultar contraseña" : "Ver contraseña"}
          className="absolute inset-y-0 right-2 my-auto grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
          onClick={onToggle}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </span>
    </label>
  );
}
