"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clearSession, getCurrentUser, getStoredToken, getStoredUser, logout, storeAuthUser, type AuthUser } from "@/lib/api";

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
      .catch(() => {
        clearSession();
        setUser(null);
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
        className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full border text-sm font-semibold shadow-sm transition ${
          isDark ? "border-white/15 bg-slate-900 text-cyan-200 hover:bg-white/10" : "border-slate-200 bg-white text-teal-800 hover:bg-slate-50"
        }`}
      >
        {user.profile_photo_url ? (
          <img src={user.profile_photo_url} alt="Foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 z-50 mt-2 w-64 rounded-lg border p-2 shadow-xl ${
          isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-950"
        }`}>
          <div className={`border-b px-3 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className={`truncate text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{user.email}</p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className={`mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
            }`}
          >
            <UserIcon />
            Perfil
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${
              isDark ? "text-rose-200 hover:bg-white/10" : "text-rose-700 hover:bg-rose-50"
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
    <>
      <Link href="/login" className="font-semibold text-teal-700">Ingresar</Link>
      <Link href="/registro" className="rounded-md bg-teal-700 px-3 py-2 font-semibold text-white">Registrarse</Link>
    </>
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

function LogoutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}
