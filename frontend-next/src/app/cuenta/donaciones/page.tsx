import { PlaceholderList } from "@/lib/SimpleViews";

export default function AccountDonationsPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Mis donaciones</h1>
      <PlaceholderList items={["S/. 50.00 · Refugio Salvando Patitas · pending", "S/. 30.00 · Hogar Bigotes · approved"]} />
    </section>
  );
}
