import { MyLostFoundList } from "@/components/MyLostFoundList";

export default function AccountFoundPetsPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Mis publicaciones de mascotas encontradas</h1>
      <MyLostFoundList type="encontrada" newHref="/cuenta/mascotas-encontradas/nueva" />
    </section>
  );
}
