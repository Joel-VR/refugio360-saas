"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; icon: string; badge?: number; external?: boolean };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminDesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        const className = `flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          active ? "bg-brand-50 text-brand-600" : "text-slate-custom-700 hover:bg-slate-custom-50 hover:text-slate-custom-900"
        }`;

        if (l.external) {
          return (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className={className}
            >
              <span className="flex items-center gap-3">
                <span>{l.icon}</span>
                {l.label}
              </span>
              {!!l.badge && (
                <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {l.badge}
                </span>
              )}
            </a>
          );
        }

        return (
          <Link
            key={l.href}
            href={l.href}
            className={className}
          >
            <span className="flex items-center gap-3">
              <span>{l.icon}</span>
              {l.label}
            </span>
            {!!l.badge && (
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {l.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        const iconClass = `relative text-xl ${active ? "opacity-100" : "opacity-60"}`;

        if (l.external) {
          return (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className={iconClass}
              title={l.label}
            >
              {l.icon}
              {!!l.badge && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                  {l.badge}
                </span>
              )}
            </a>
          );
        }

        return (
          <Link key={l.href} href={l.href} className={iconClass} title={l.label}>
            {l.icon}
            {!!l.badge && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                {l.badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}
