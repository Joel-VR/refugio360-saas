import Link from "next/link";
import { PlaceholderList } from "@/lib/SimpleViews";

export default function AccountFoundPetsPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Mis publicaciones de mascotas encontradas</h1>
      <Link href="/cuenta/mascotas-encontradas/nueva" className="w-fit rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Nuevo reporte</Link>
      <PlaceholderList items={["Gato naranja · pending", "Perrita pequeña · approved"]} />
    </section>
  );
}
