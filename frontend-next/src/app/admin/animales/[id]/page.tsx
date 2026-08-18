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
    <main className="px-4 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600 sm:text-sm">Detalle / Edición</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-custom-900 sm:text-4xl">Editar animal</h1>
          </div>
          <Link
            href="/admin/animales"
            className="self-start rounded-full border border-slate-custom-50 px-4 py-2 text-sm text-slate-custom-700 transition hover:bg-slate-custom-50 sm:self-auto"
          >
            Volver al listado
          </Link>
        </div>

        <EditAnimalForm animal={animal} />
      </section>
    </main>
  );
}