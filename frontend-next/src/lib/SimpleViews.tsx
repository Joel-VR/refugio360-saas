import Link from "next/link";
import Image from "next/image";
import { AuthNav } from "@/components/ProfileMenu";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream-100 text-slate-custom-900">
      <nav className="border-b border-slate-custom-50 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-600">
          <Image
            src="/logo.png"
            alt="Logo"
            width={38}
            height={38}
          />
          <span>Refugio360</span>
        </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-custom-700">
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
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">{eyebrow}</p>}
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-6 text-slate-custom-700">{description}</p>}
        {children}
      </section>
    </PublicShell>
  );
}

export function PlaceholderList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="rounded-lg border border-slate-custom-50 bg-cream-50 p-4 text-sm text-slate-custom-700">
          {item}
        </div>
      ))}
    </div>
  );
}
