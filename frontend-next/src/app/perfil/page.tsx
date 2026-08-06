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

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(() => readInitialUser());
  const [name, setName] = useState(() => readInitialUser()?.name ?? "");
  const [email, setEmail] = useState(() => readInitialUser()?.email ?? "");
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

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-4xl gap-6 px-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Perfil</h1>
          <p className="mt-2 text-sm text-slate-custom-700">Administra tus datos de cuenta, contraseña y foto de perfil.</p>
        </div>

        {message && <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <section className="grid h-fit gap-4 rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
            <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-slate-custom-50 bg-cream-100 text-3xl font-semibold text-brand-600">
              {user?.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <label className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-custom-700 hover:bg-cream-100">
              {loadingPhoto ? "Subiendo..." : "Agregar foto"}
              <input disabled={loadingPhoto} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={savePhoto} />
            </label>
            <div className="text-center text-sm">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-slate-500">{roleLabel(user?.role)}</p>
            </div>
          </section>

          <div className="grid gap-6">
            <form onSubmit={saveProfile} className="grid gap-4 rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
              <h2 className="text-xl font-semibold">Datos personales</h2>
              <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
                Nombre
                <input required className="rounded-md border border-slate-300 px-3 py-2 font-normal" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
                Correo
                <input required type="email" className="rounded-md border border-slate-300 px-3 py-2 font-normal" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
                Rol
                <input readOnly className="rounded-md border border-slate-custom-50 bg-cream-100 px-3 py-2 font-normal text-slate-custom-700" value={roleLabel(user?.role)} />
              </label>
              <button disabled={loadingProfile} className="w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
                {loadingProfile ? "Guardando..." : "Guardar datos"}
              </button>
            </form>

            <form onSubmit={savePassword} className="grid gap-4 rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Cambiar contraseña</h2>
                <button type="button" onClick={() => setShowPasswords((value) => !value)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 text-slate-custom-700 hover:bg-cream-100" title={showPasswords ? "Ocultar contraseñas" : "Ver contraseñas"} aria-label={showPasswords ? "Ocultar contraseñas" : "Ver contraseñas"}>
                  <EyeIcon />
                </button>
              </div>
              <PasswordInput label="Contraseña actual" value={currentPassword} show={showPasswords} onChange={setCurrentPassword} autoComplete="current-password" />
              <PasswordInput label="Nueva contraseña" value={password} show={showPasswords} onChange={setPassword} autoComplete="new-password" />
              <PasswordInput label="Repetir nueva contraseña" value={passwordConfirmation} show={showPasswords} onChange={setPasswordConfirmation} autoComplete="new-password" />
              <p className="text-sm text-slate-custom-700">La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.</p>
              <button disabled={loadingPassword} className="w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
                {loadingPassword ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>
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
    <label className="grid gap-1 text-sm font-medium text-slate-custom-700">
      {label}
      <input
        required
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        className="rounded-md border border-slate-300 px-3 py-2 font-normal"
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
