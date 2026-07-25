import { PlaceholderList } from "@/lib/SimpleViews";

export default function AccountAdoptionsPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Mis solicitudes de adopción</h1>
      <PlaceholderList items={["Solicitud para Luna · pending", "Solicitud para Max · reviewing"]} />
    </section>
  );
}
