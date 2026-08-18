"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  getStoredToken,
  getStoredUser,
  storeAuthUser,
  updatePassword,
  updateProfile,
  updateProfilePhoto,
  type AuthUser,
} from "@/lib/api";
import { PublicShell } from "@/lib/SimpleViews";
import { PaymentMethodsPanel } from "../admin/configuracion/PaymentMethodsPanel";
import { ShelterProfileForm } from "../admin/configuracion/ShelterProfileForm";

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-1.5 0h12a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-12a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z",
  camera: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.19 2.19 0 00-1.854-1.025h-3.986a2.19 2.19 0 00-1.854 1.025L6.827 6.175zM15 12.75a3 3 0 11-6 0 3 3 0 016 0z",
  mail: "M2.25 6.75c0-.828.672-1.5 1.5-1.5h16.5c.828 0 1.5.672 1.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75zm0 0l9.75 6.75 9.75-6.75",
  badge: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const ROLE_TONES: Record<string, { badge: string; ring: string }> = {
  natural_person: { badge: "bg-violet-100 text-violet-700", ring: "ring-violet-200" },
  shelter_admin: { badge: "bg-sky-100 text-sky-700", ring: "ring-sky-200" },
  super_admin: { badge: "bg-amber-100 text-amber-700", ring: "ring-amber-200" },
};

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  function hydrateUser(nextUser: AuthUser) {
    setUser(nextUser);
    setName(nextUser.name);
    setEmail(nextUser.email);
  }

  function syncUser(nextUser: AuthUser) {
    storeAuthUser(nextUser);
    hydrateUser(nextUser);
    window.dispatchEvent(new Event("auth-user-updated"));
  }

  useEffect(() => {
    const stored = readInitialUser();
    if (stored) hydrateUser(stored);

    if (!getStoredToken()) {
      window.location.href = "/login?next=/perfil";
      return;
    }

    getCurrentUser()
      .then(({ user }) => {
        storeAuthUser(user);
        hydrateUser(user);
        window.dispatchEvent(new Event("auth-user-updated"));
      })
      .catch(() => {
        window.location.href = "/login?next=/perfil";
      });
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoadingProfile(true);
    try {
      const response = await updateProfile({ name, email });
      syncUser(response.user);
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el perfil.");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoadingPassword(true);
    try {
      const response = await updatePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setLoadingPassword(false);
    }
  }

  async function savePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    setError("");
    setLoadingPhoto(true);
    try {
      const response = await updateProfilePhoto(file);
      syncUser(response.user);
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setLoadingPhoto(false);
      event.target.value = "";
    }
  }

  const initial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();
  const tone = ROLE_TONES[user?.role ?? ""] ?? { badge: "bg-slate-100 text-slate-600", ring: "ring-slate-200" };
return (
    <PublicShell>
      <section className="mx-auto grid max-w-4xl gap-6 px-6 py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Cuenta</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Perfil</h1>
          <p className="mt-2 text-sm text-slate-custom-700">Administra tus datos de cuenta, contraseña y foto de perfil.</p>
        </div>

        {message && (
          <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <Icon path={ICONS.badge} className="h-4 w-4 flex-shrink-0" />
            {message}
          </p>
        )}
        {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Tarjeta de identidad */}
          <section className="grid h-fit gap-4 rounded-2xl border border-slate-custom-50 bg-white p-6 text-center shadow-sm">
            <div className="relative mx-auto">
              <div className={`grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-cream-100 text-3xl font-semibold text-brand-600 ring-4 ${tone.ring}`}>
                {user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm transition hover:bg-brand-700">
                <Icon path={ICONS.camera} className="h-4 w-4" />
                <input disabled={loadingPhoto} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={savePhoto} />
              </label>
            </div>

            {loadingPhoto && <p className="text-xs text-slate-500">Subiendo foto...</p>}

            <div>
              <p className="font-semibold text-slate-custom-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
              <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                {roleLabel(user?.role)}
              </span>
            </div>
          </section>

          <div className="grid gap-6">
            {/* Datos personales */}
            <form onSubmit={saveProfile} className="grid gap-4 rounded-2xl border border-slate-custom-50 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
                  <Icon path={ICONS.user} className="h-4.5 w-4.5" />
                </span>
                <h2 className="text-lg font-semibold text-slate-custom-900">Datos personales</h2>
              </div>

              <label className="grid gap-1.5 text-sm font-medium text-slate-custom-700">
                Nombre
                <input
                  required
                  className="rounded-lg border border-slate-custom-50 bg-cream-50 px-3 py-2.5 font-normal outline-none transition focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/10"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-custom-700">
                Correo
                <div className="relative">
                  <Icon path={ICONS.mail} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="email"
                    className="w-full rounded-lg border border-slate-custom-50 bg-cream-50 py-2.5 pl-9 pr-3 font-normal outline-none transition focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/10"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-custom-700">
                Rol
                <input readOnly className="rounded-lg border border-slate-custom-50 bg-cream-100 px-3 py-2.5 font-normal text-slate-custom-700" value={roleLabel(user?.role)} />
              </label>
              <button
                disabled={loadingProfile}
                className="w-fit rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingProfile ? "Guardando..." : "Guardar datos"}
              </button>
            </form>

            {/* Contraseña */}
            <form onSubmit={savePassword} className="grid gap-4 rounded-2xl border border-slate-custom-50 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
                    <Icon path={ICONS.lock} className="h-4.5 w-4.5" />
                  </span>
                  <h2 className="text-lg font-semibold text-slate-custom-900">Cambiar contraseña</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswords((value) => !value)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-slate-custom-50 text-slate-custom-700 transition hover:bg-cream-50"
                  title={showPasswords ? "Ocultar contraseñas" : "Ver contraseñas"}
                  aria-label={showPasswords ? "Ocultar contraseñas" : "Ver contraseñas"}
                >
                  <EyeIcon />
                </button>
              </div>

              <PasswordInput label="Contraseña actual" value={currentPassword} show={showPasswords} onChange={setCurrentPassword} autoComplete="current-password" />
              <PasswordInput label="Nueva contraseña" value={password} show={showPasswords} onChange={setPassword} autoComplete="new-password" />
              <PasswordInput label="Repetir nueva contraseña" value={passwordConfirmation} show={showPasswords} onChange={setPasswordConfirmation} autoComplete="new-password" />

              <p className="rounded-lg bg-cream-50 px-3 py-2.5 text-xs leading-5 text-slate-custom-700">
                La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.
              </p>

              <button
                disabled={loadingPassword}
                className="w-fit rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingPassword ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>

            {/* SI EL USUARIO ES UN ALBERGUE, SE MUESTRAN SUS CONFIGURACIONES */}
            {user?.role === "shelter_admin" && (
              <div className="grid gap-6 pt-2">
                <div className="rounded-2xl border border-slate-custom-50 bg-white p-6 shadow-sm">
                  <ShelterProfileForm shelter={(user as any)?.shelter} />
                </div>
                <div className="rounded-2xl border border-slate-custom-50 bg-white p-6 shadow-sm">
                  <PaymentMethodsPanel shelter={(user as any)?.shelter} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );

}

function readInitialUser() {
  return getStoredToken() ? getStoredUser() : null;
}

function PasswordInput({
  label,
  value,
  show,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-custom-700">
      {label}
      <input
        required
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        className="rounded-lg border border-slate-custom-50 bg-cream-50 px-3 py-2.5 font-normal outline-none transition focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function roleLabel(role?: string) {
  if (role === "natural_person") return "Persona natural";
  if (role === "shelter_admin") return "Albergue";
  if (role === "super_admin") return "Super admin";
  return "Usuario";
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  
    
}
