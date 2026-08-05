import { getShelter } from "@/lib/api";
import EditShelterForm from "./EditShelterForm";
import PaymentMethodsPanel from "./PaymentMethodsPanel";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditShelterPage({ params }: Props) {
  const { id } = await params;
  let shelter;
  try {
    shelter = await getShelter(id);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Editar</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{shelter.name}</h1>
          </div>
          <Link
            href="/admin/albergues"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-cream-50/10"
          >
            Volver
          </Link>
        </div>
        <div className="grid gap-6">
          <EditShelterForm shelter={shelter} />
          <PaymentMethodsPanel shelter={shelter} />
        </div>
      </section>
    </main>
  );
}
