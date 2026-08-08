import Link from "next/link";
import { getAdoptionsPage, getShelters } from "@/lib/api";
import { getServerAuthHeaders } from "@/lib/server-auth";
import AdoptionStatusUpdater from "./AdoptionStatusUpdater";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: "Pendiente",  cls: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
  evaluacion: { label: "Evaluación", cls: "bg-blue-400/10 text-blue-300 border-blue-400/30" },
  aprobado:   { label: "Aprobado",   cls: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
  rechazado:  { label: "Rechazado",  cls: "bg-rose-400/10 text-rose-300 border-rose-400/30" },
  adoptado:   { label: "Adoptado",   cls: "bg-violet-400/10 text-violet-300 border-violet-400/30" },
};

const FILTERS = [
  { label: "Todas",      value: "" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Evaluación", value: "evaluacion" },
  { label: "Aprobadas",  value: "aprobado" },
  { label: "Rechazadas", value: "rechazado" },
  { label: "Adoptados",  value: "adoptado" },
];

type Props = { searchParams?: Promise<{ status?: string; page?: string }> };

export default async function AdoptionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const activeStatus = params?.status ?? "";
  const currentPage = Number(params?.page ?? "1") || 1;

  let adoptions = [];
  let shelters = [];
  let pageInfo = { currentPage: 1, lastPage: 1, total: 0 };

  try {
    // Cargamos adopciones y shelters en paralelo
    const headers = await getServerAuthHeaders();
    const [adoptionsResult, sheltersResult] = await Promise.all([
      getAdoptionsPage({ ...(activeStatus ? { status: activeStatus } : {}), page: currentPage }, headers),
      getShelters(false, headers),
    ]);
    adoptions = adoptionsResult.items;
    pageInfo = adoptionsResult.page;
    shelters = sheltersResult;
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center text-rose-700 text-sm">
        Error al cargar datos. Verifica que el backend esté activo.
      </div>
    );
  }

  // Mapa de shelters por id para acceso rápido
  const shelterMap = shelters.reduce((map, shelter) => {
    map[shelter.id] = shelter;
    return map;
  }, {} as Record<number, { id: number; name: string }>);

  return (
    <main className="px-6 py-10">
      <section className="mx-auto w-full max-w-6xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Admin</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-custom-900">Solicitudes de adopción</h1>
              <p className="mt-1 text-sm text-slate-custom-400">
                {adoptions.length} solicitudes{activeStatus ? ` · filtro: ${activeStatus}` : ""}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            {FILTERS.map((f) => {
              const isActive = f.value === activeStatus;
              const href = f.value
                ? `/admin/adopciones?status=${f.value}`
                : "/admin/adopciones";
              return (
                <a
                  key={f.label}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "border border-slate-custom-50 bg-cream-100 text-slate-custom-700 hover:bg-slate-custom-50"
                  }`}
                >
                  {f.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {adoptions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-custom-50 bg-cream-50 p-16 text-center">
            <p className="text-3xl">📋</p>
            <p className="mt-4 text-slate-custom-400">
              No hay solicitudes{activeStatus ? ` con estado "${activeStatus}"` : ""}.
            </p>
          </div>
        )}

        {/* Cards grid */}
        {adoptions.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {adoptions.map((adoption) => {
              const badge = STATUS_BADGE[adoption.status] ?? {
                label: adoption.status,
                cls: "bg-slate-400/10 text-slate-400 border-slate-400/30",
              };

              const shelterName = adoption.animal?.shelter_id
                ? shelterMap[adoption.animal.shelter_id]?.name ?? `ID ${adoption.animal.shelter_id}`
                : null;

              return (
                <div
                  key={adoption.id}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-custom-50 bg-cream-50 p-5 shadow-sm"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-custom-400">
                        #{adoption.id} · {new Date(adoption.created_at!).toLocaleDateString("es-PE")}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-custom-900">
                        {adoption.applicant_name}
                      </h2>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Datos del solicitante */}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-custom-400">
                    <dt className="text-slate-custom-400">DNI</dt>
                    <dd className="text-slate-custom-700">{adoption.dni}</dd>
                    <dt className="text-slate-custom-400">Teléfono</dt>
                    <dd className="text-slate-custom-700">{adoption.phone}</dd>
                    <dt className="text-slate-custom-400">Dirección</dt>
                    <dd className="text-slate-custom-700 col-span-1 truncate">{adoption.address}</dd>
                  </dl>

                  {/* Animal y albergue */}
                  <div className="rounded-xl border border-slate-custom-50 bg-cream-100 px-3 py-2 text-xs">
                    <span className="text-slate-custom-400">Animal: </span>
                    <span className="text-slate-custom-900 font-medium">
                      {adoption.animal?.name
                        ? `${adoption.animal.name} (${adoption.animal.species})`
                        : `#${adoption.animal_id}`}
                    </span>
                    {shelterName && (
                      <span className="ml-2 text-slate-custom-400">
                        · Albergue: {shelterName}
                      </span>
                    )}
                  </div>

                  {/* Notas */}
                  {adoption.notes && (
                    <p className="text-xs text-slate-custom-400 italic line-clamp-2">
                      &ldquo;{adoption.notes}&rdquo;
                    </p>
                  )}

                  {/* Cambiar estado */}
                  <AdoptionStatusUpdater adoption={adoption} />
                </div>
              );
            })}
          </div>
        )}

        {pageInfo.lastPage > 1 && (
          <div className="flex items-center justify-between text-sm text-slate-custom-400">
            <Link
              href={`/admin/adopciones?${new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), page: String(Math.max(1, currentPage - 1)) })}`}
              className={`rounded-full border border-slate-custom-50 px-4 py-2 ${currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-custom-50"}`}
            >
              ← Anterior
            </Link>
            <span>Página {pageInfo.currentPage} de {pageInfo.lastPage} · {pageInfo.total} solicitudes</span>
            <Link
              href={`/admin/adopciones?${new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), page: String(Math.min(pageInfo.lastPage, currentPage + 1)) })}`}
              className={`rounded-full border border-slate-custom-50 px-4 py-2 ${currentPage >= pageInfo.lastPage ? "pointer-events-none opacity-40" : "hover:bg-slate-custom-50"}`}
            >
              Siguiente →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
