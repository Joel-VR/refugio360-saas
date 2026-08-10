import Link from "next/link";
import { MyLostFoundList } from "@/components/MyLostFoundList";

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function AccountFoundPetsPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
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
    </section>
  );
}