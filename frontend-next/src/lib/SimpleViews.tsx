import Link from "next/link";
import { AuthNav } from "@/components/ProfileMenu";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f8f3] text-slate-950">
      <nav className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold text-teal-800">Refugio360</Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
            <Link href="/refugios">Refugios</Link>
            <Link href="/mascotas/perdidas">Perdidas</Link>
            <Link href="/mascotas/encontradas">Encontradas</Link>
            <AuthNav />
          </div>
        </div>
      </nav>
      {children}
    </main>
  );
}

export function SimplePage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-12">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{eyebrow}</p>}
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
        {children}
      </section>
    </PublicShell>
  );
}

export function PlaceholderList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          {item}
        </div>
      ))}
    </div>
  );
}
