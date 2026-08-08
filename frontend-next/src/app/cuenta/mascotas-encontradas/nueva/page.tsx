import { LostFoundForm } from "@/components/LostFoundForm";

export default function NewFoundPetPage() {
  return (
    <section className="mx-auto grid max-w-3xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Reportar mascota encontrada</h1>
      <LostFoundForm type="encontrada" backHref="/cuenta/mascotas-encontradas" />
    </section>
  );
}
