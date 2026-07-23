import { getAdoptions, getShelters } from "@/lib/api";
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

type Props = { searchParams?: Promise<{ status?: string }> };

export default async function AdoptionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const activeStatus = params?.status ?? "";

  let adoptions = [];
  let shelters = [];

  try {
    // Cargamos adopciones y shelters en paralelo
    [adoptions, shelters] = await Promise.all([
      getAdoptions(activeStatus ? { status: activeStatus } : {}),
      getShelters(),
    ]);
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-rose-300 text-sm">
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-6xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Admin</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">Solicitudes de adopción</h1>
              <p className="mt-1 text-sm text-slate-400">
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
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
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
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-16 text-center">
            <p className="text-3xl">📋</p>
            <p className="mt-4 text-slate-400">
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
                  className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-lg"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400">
                        #{adoption.id} · {new Date(adoption.created_at!).toLocaleDateString("es-PE")}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-100">
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
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                    <dt className="text-slate-500">DNI</dt>
                    <dd className="text-slate-300">{adoption.dni}</dd>
                    <dt className="text-slate-500">Teléfono</dt>
                    <dd className="text-slate-300">{adoption.phone}</dd>
                    <dt className="text-slate-500">Dirección</dt>
                    <dd className="text-slate-300 col-span-1 truncate">{adoption.address}</dd>
                  </dl>

                  {/* Animal y albergue */}
                  <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs">
                    <span className="text-slate-500">Animal: </span>
                    <span className="text-slate-200 font-medium">
                      {adoption.animal?.name
                        ? `${adoption.animal.name} (${adoption.animal.species})`
                        : `#${adoption.animal_id}`}
                    </span>
                    {shelterName && (
                      <span className="ml-2 text-slate-400">
                        · Albergue: {shelterName}
                      </span>
                    )}
                  </div>

                  {/* Notas */}
                  {adoption.notes && (
                    <p className="text-xs text-slate-400 italic line-clamp-2">
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
      </section>
    </main>
  );
}
