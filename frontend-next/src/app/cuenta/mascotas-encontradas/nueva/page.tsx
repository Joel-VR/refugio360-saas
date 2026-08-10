import Link from "next/link";
import { LostFoundForm } from "@/components/LostFoundForm";

export default function NewFoundPetPage() {
  return (
    <section className="mx-auto grid max-w-3xl gap-5 px-6 py-10">
      <Link
        href="/cuenta/mascotas-encontradas"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-custom-50 bg-white px-4 py-2 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a mis reportes
      </Link>
      <h1 className="text-3xl font-semibold">Reportar mascota encontrada</h1>
      <LostFoundForm type="encontrada" backHref="/cuenta/mascotas-encontradas" />
    </section>
  );
}