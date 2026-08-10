import Link from "next/link";
import { MyLostFoundList } from "@/components/MyLostFoundList";

function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export default function AccountLostPetsPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Mis publicaciones de mascotas perdidas</h1>
        <Link
          href="/cuenta/mascotas-perdidas/nueva"
          className="inline-flex w-fit items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <PinIcon />
          Nueva publicación
        </Link>
      </div>
      <MyLostFoundList type="perdida" newHref="/cuenta/mascotas-perdidas/nueva" />
    </section>
  );
}