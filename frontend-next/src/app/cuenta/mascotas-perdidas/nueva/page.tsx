import { LostFoundForm } from "@/components/LostFoundForm";

export default function NewLostPetPage() {
  return (
    <section className="mx-auto grid max-w-3xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Publicar mascota perdida</h1>
      <LostFoundForm type="perdida" backHref="/cuenta/mascotas-perdidas" />
    </section>
  );
}
