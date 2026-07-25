import Link from "next/link";
import { PlaceholderList } from "@/lib/SimpleViews";

export default function AccountLostPetsPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Mis publicaciones de mascotas perdidas</h1>
      <Link href="/cuenta/mascotas-perdidas/nueva" className="w-fit rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Nueva publicación</Link>
      <PlaceholderList items={["Luna · pending", "Max · approved"]} />
    </section>
  );
}
