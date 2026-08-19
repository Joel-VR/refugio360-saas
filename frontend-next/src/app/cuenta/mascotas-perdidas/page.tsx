import Link from "next/link";
import { MyLostFoundList } from "@/components/MyLostFoundList";
import { LostFoundPublicList } from "@/components/LostFoundPublicList";

function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export default function AccountLostPetsPage() {
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-10 overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      {/* Mis publicaciones */}
      <div className="grid w-full min-w-0 gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold sm:text-3xl">Mis publicaciones de mascotas perdidas</h1>
          <Link
            href="/cuenta/mascotas-perdidas/nueva"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <PinIcon />
            Nueva publicación
          </Link>
        </div>
        <div className="w-full min-w-0 overflow-x-hidden">
          <MyLostFoundList type="perdida" newHref="/cuenta/mascotas-perdidas/nueva" />
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-slate-custom-50" />

      {/* Todas las publicaciones del sistema */}
      <div className="grid w-full min-w-0 gap-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-custom-900 sm:text-2xl">Mascotas perdidas en la comunidad</h2>
          <p className="mt-1 text-sm text-slate-custom-700">Publicaciones aprobadas por el super admin, de todos los usuarios.</p>
        </div>
        <div className="w-full min-w-0 overflow-x-hidden">
          <LostFoundPublicList type="perdida" publishHref="/cuenta/mascotas-perdidas/nueva" />
        </div>
      </div>
    </section>
  );
}