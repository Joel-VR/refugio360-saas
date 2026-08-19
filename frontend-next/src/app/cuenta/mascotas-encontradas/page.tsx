import Link from "next/link";
import { MyLostFoundList } from "@/components/MyLostFoundList";
import { LostFoundPublicList } from "@/components/LostFoundPublicList";

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function AccountFoundPetsPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-6 py-10">
      {/* Mis reportes */}
      <div className="grid gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold">Mis reportes de mascotas encontradas</h1>
          <Link
            href="/cuenta/mascotas-encontradas/nueva"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <CheckIcon />
            Nuevo reporte
          </Link>
        </div>
        <MyLostFoundList type="encontrada" newHref="/cuenta/mascotas-encontradas/nueva" />
      </div>

      {/* Separador */}
      <div className="border-t border-slate-custom-50" />

      {/* Todas las publicaciones del sistema */}
      <div className="grid gap-5">
        <div>
          <h2 className="text-2xl font-semibold text-slate-custom-900">Mascotas encontradas en la comunidad</h2>
          <p className="mt-1 text-sm text-slate-custom-700">Publicaciones aprobadas por el super admin, de todos los usuarios.</p>
        </div>
        <LostFoundPublicList type="encontrada" publishHref="/cuenta/mascotas-encontradas/nueva" />
      </div>
    </section>
  );
}