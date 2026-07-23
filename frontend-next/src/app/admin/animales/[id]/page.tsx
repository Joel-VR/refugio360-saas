// src/app/admin/animales/[id]/page.tsx
import { getAnimal } from "@/lib/api";
import Link from "next/link";
import EditAnimalForm from "./EditAnimalForm"; // lo crearemos a continuación

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AnimalDetailPage({ params }: Props) {
  const { id } = await params;
  const animal = await getAnimal(id);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Detalle / Edición</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Editar animal</h1>
          </div>
          <Link
            href="/admin/animales"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Volver al listado
          </Link>
        </div>

        <EditAnimalForm animal={animal} />
      </section>
    </main>
  );
}
