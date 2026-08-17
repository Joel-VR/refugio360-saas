import Link from "next/link";
import { getAnimalsPage } from "@/lib/api";
import { AnimalStatusDropdown } from './AnimalStatusDropdown';
import { getAdminAnimalsPage } from "@/lib/api";
import { getServerAuthHeaders } from "@/lib/server-auth";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  apto: { label: "Apto adopción", className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
  cuarentena: { label: "Cuarentena", className: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
  tratamiento: { label: "Tratamiento", className: "bg-orange-400/10 text-orange-300 border-orange-400/30" },
  adoptado: { label: "Adoptado", className: "bg-slate-400/10 text-slate-400 border-slate-400/30" },
};

const FILTERS = [
  { label: "Todos", value: "" },
  { label: "Apto adopción", value: "apto_adopcion" },
];

type AnimalsPageProps = {
  searchParams?: Promise<{ status?: string; page?: string }>;
};

export default async function AnimalsPage({ searchParams }: AnimalsPageProps) {
  const params = await searchParams;
  const activeStatus = params?.status ?? "";
  const currentPage = Number(params?.page ?? "1") || 1;
  const { items: animals, page } = await getAdminAnimalsPage(
    { ...(activeStatus ? { status: activeStatus } : {}), page: currentPage },
    await getServerAuthHeaders()
  );

  return (
    <main className="px-6 py-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Admin</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-custom-900">Animales registrados</h1>
            </div>
            <Link
              href="/admin/animales/nuevo"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              + Nuevo animal
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {FILTERS.map((filter) => {
              const isActive = filter.value === activeStatus;
              const href = filter.value ? `/admin/animales?status=${filter.value}` : "/admin/animales";
              return (
                <Link
                  key={filter.label}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "border border-slate-custom-50 bg-cream-100 text-slate-custom-700 hover:bg-slate-custom-50"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {animals.map((animal) => {
            const badge = STATUS_BADGE[animal.lifecycle_status] ?? {
              label: animal.lifecycle_status,
              className: "bg-slate-400/10 text-slate-400 border-slate-400/30",
            };
            const photo = animal.photos?.[0];

            return (
              <div
                key={animal.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-custom-50 bg-cream-50 shadow-sm transition hover:border-brand-600 hover:shadow-md"
              >
                {/* foto — clickeable para ir al detalle */}
                <Link href={`/admin/animales/${animal.id}`} className="block">
                  <div className="relative h-48 bg-slate-200 flex items-center justify-center text-5xl">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${STORAGE_URL}/${photo.photo_path}`}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{animal.species === "gato" ? "🐱" : animal.species === "perro" ? "🐶" : "🐾"}</span>
                    )}
                    <span className={`absolute top-3 right-3 rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                </Link>

                {/* info */}
                <div className="flex flex-col gap-2 p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-custom-400">{animal.species}</p>
                  <h2 className="text-xl font-semibold text-slate-custom-900">{animal.name}</h2>
                  {animal.health_status && (
                    <p className="text-sm text-slate-custom-400 line-clamp-2">{animal.health_status}</p>
                  )}
                  <AnimalStatusDropdown animalId={animal.id} current={animal.lifecycle_status} />
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-custom-400">
                    <span>Refugio #{animal.shelter_id}</span>
                    <span>{animal.photos?.length ?? 0} foto{animal.photos?.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {animals.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-custom-50 bg-cream-50 p-8 text-center text-slate-custom-700">
            No hay animales para el filtro seleccionado.
          </div>
        )}

        {page.lastPage > 1 && (
          <div className="flex items-center justify-between text-sm text-slate-custom-400">
            <Link
              href={`/admin/animales?${new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), page: String(Math.max(1, currentPage - 1)) })}`}
              className={`rounded-full border border-slate-custom-50 px-4 py-2 ${currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-custom-50"}`}
            >
              ← Anterior
            </Link>
            <span>Página {page.currentPage} de {page.lastPage} · {page.total} animales</span>
            <Link
              href={`/admin/animales?${new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), page: String(Math.min(page.lastPage, currentPage + 1)) })}`}
              className={`rounded-full border border-slate-custom-50 px-4 py-2 ${currentPage >= page.lastPage ? "pointer-events-none opacity-40" : "hover:bg-slate-custom-50"}`}
            >
              Siguiente →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}