import { PlaceholderList } from "@/lib/SimpleViews";

export default function AccountHomePage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Cuenta de persona natural</h1>
      <PlaceholderList items={["Solicitar adopciones", "Registrar donaciones", "Publicar mascotas perdidas", "Reportar mascotas encontradas"]} />
    </section>
  );
}
