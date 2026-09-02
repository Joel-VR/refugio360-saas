"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { clearSession, getCurrentUser, getStoredToken, getStoredUser, logout, storeAuthUser, ApiAuthError, type AuthUser } from "@/lib/api";

export function ProfileMenu({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [user, setUser] = useState<AuthUser | null>(() => (getStoredToken() ? getStoredUser() : null));
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";

  useEffect(() => {
  if (!getStoredToken()) return;

  getCurrentUser()
    .then(({ user }) => {
      storeAuthUser(user);
      setUser(user);
    })
    .catch((err) => {
      // Solo cerramos sesión si el backend confirmó explícitamente que el token no es válido.
      // Un fallo de red, CORS o backend caído momentáneamente NO debe desloguear.
      if (err instanceof ApiAuthError) {
        clearSession();
        setUser(null);
      }
      // si es otro tipo de error, no tocamos la sesión; el usuario sigue viéndose logueado
      // con los datos que ya tenía en localStorage (getStoredUser inicial)
    });

    function handleStorage() {
      setUser(getStoredUser());
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-user-updated", handleStorage);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-user-updated", handleStorage);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  if (!user) return null;

  const initial = (user.name || user.email || "U").trim().charAt(0).toUpperCase();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      clearSession();
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Abrir menú de perfil"
        title="Perfil"
        onClick={() => setOpen((value) => !value)}
        className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border text-sm font-semibold shadow-sm transition ${
          isDark ? "border-white/15 bg-slate-custom-900 text-cyan-200 hover:bg-cream-50/10" : "border-slate-custom-50 bg-cream-50 text-brand-600 hover:bg-cream-100"
        }`}
      >
        {user.profile_photo_url ? (
          <Image src={user.profile_photo_url} alt="Foto de perfil" fill sizes="40px" className="object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 z-50 mt-2 w-64 rounded-lg border p-2 shadow-xl ${
          isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-custom-50 bg-cream-50 text-slate-custom-900"
        }`}>
          <div className={`border-b px-3 py-3 ${isDark ? "border-white/10" : "border-slate-custom-50"}`}>
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className={`truncate text-xs ${isDark ? "text-slate-400" : "text-slate-custom-400"}`}>{user.email}</p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className={`mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              isDark ? "hover:bg-cream-50/10" : "hover:bg-slate-custom-50"
            }`}
          >
            <UserIcon />
            Perfil
          </Link>
          {user.role === "super_admin" && (
            <Link
              href="/superadmin"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                isDark ? "hover:bg-cream-50/10" : "hover:bg-slate-custom-50"
              }`}
            >
              <DashboardIcon />
              Panel de administración
            </Link>
          )}
          {user.role === "shelter_admin" && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                isDark ? "hover:bg-cream-50/10" : "hover:bg-slate-custom-50"
              }`}
            >
              <DashboardIcon />
              Panel de administración
            </Link>
          )}
          {user.role === "shelter_admin" && (
            <Link
              href="/admin/configuracion"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                isDark ? "hover:bg-cream-50/10" : "hover:bg-slate-custom-50"
              }`}
            >
              <SettingsIcon />
              Configuración
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${
              isDark ? "text-rose-200 hover:bg-cream-50/10" : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
export function AuthNav() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    function sync() {
      setHasSession(Boolean(getStoredToken()));
    }

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth-user-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-user-updated", sync);
    };
  }, []);

  if (hasSession) return <ProfileMenu />;

  return (
    <div className="flex items-center gap-3">
      <Link 
        href="/login" 
        className="px-4 py-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
      >
        Ingresar
      </Link>
      
      <Link 
        href="/registro" 
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition-all"
      >
        Registrarse
      </Link>
    </div>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}
