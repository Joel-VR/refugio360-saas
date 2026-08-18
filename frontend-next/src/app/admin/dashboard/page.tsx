import Link from "next/link";
import { getDashboardStats } from "@/lib/api";
import { getServerAuthHeaders } from "@/lib/server-auth";

const ADOPTION_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: "Pendiente",  cls: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
  evaluacion: { label: "Evaluación", cls: "bg-blue-400/10 text-blue-300 border-blue-400/30" },
  aprobado:   { label: "Aprobado",   cls: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
  rechazado:  { label: "Rechazado",  cls: "bg-rose-400/10 text-rose-300 border-rose-400/30" },
  adoptado:   { label: "Adoptado",   cls: "bg-violet-400/10 text-violet-300 border-violet-400/30" },
};

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-custom-50 bg-cream-50 p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <p className={`text-xs font-semibold uppercase tracking-widest ${color}`}>{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-custom-900 sm:text-4xl">{value}</p>
      {sub && <p className="mt-1 text-sm text-slate-custom-700">{sub}</p>}
    </div>
  );
}

function ProgressBar({
  value,
  total,
  color,
}: {
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex-1 h-1.5 rounded-full bg-slate-custom-50 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-slate-custom-700">{pct}%</span>
    </div>
  );
}

export default async function DashboardPage() {
  let stats;
  let errorMsg: string | null = null;

  try {
    stats = await getDashboardStats(await getServerAuthHeaders());
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Error desconocido";
  }

  if (errorMsg || !stats) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-4xl">⚠️</p>
        <p className="text-lg font-semibold text-rose-700">No se pudo conectar con la API</p>
        <p className="max-w-md text-sm text-slate-custom-700">
          {errorMsg}
        </p>
        <div className="mt-4 rounded-2xl border border-slate-custom-50 bg-slate-custom-50/20 p-4 text-left text-xs text-slate-custom-700 font-mono w-full max-w-md overflow-x-auto">
          <p className="text-slate-custom-700 mb-1 font-semibold">Verifica:</p>
          <p>1. Laravel corriendo: <span className="text-brand-600">php artisan serve</span></p>
          <p>2. URL en <span className="text-brand-600">.env.local</span>: <span className="text-slate-custom-900">NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1</span></p>
          <p>3. Migración: <span className="text-brand-600">php artisan migrate</span></p>
          <p>4. CORS activo en Laravel</p>
        </div>
      </div>
    );
  }

  const { animals, adoptions, recent_adoptions } = stats;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-6xl flex flex-col gap-6 sm:gap-8">

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600 sm:text-sm">Refugio</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-custom-900 sm:text-4xl">Dashboard</h1>
          </div>
          <Link
            href="/admin/animales/nuevo"
            className="rounded-full border border-slate-custom-50 px-4 py-2 text-sm font-medium text-slate-custom-700 transition hover:bg-slate-custom-50 w-fit"
          >
            + Animal
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <StatCard label="Animales totales" value={animals.total} color="text-brand-600" />
          <StatCard
            label="Disponibles"
            value={animals.apto}
            sub="Listos para adopción"
            color="text-sage-600"
          />
          <StatCard label="Adopciones" value={adoptions.total} color="text-brand-600" />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Animales por estado */}
          <div className="rounded-2xl border border-slate-custom-50 bg-cream-50 p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-custom-700">
              Animales por estado
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Apto adopción", value: animals.apto,        color: "bg-emerald-400" },
                { label: "Cuarentena",    value: animals.cuarentena,  color: "bg-amber-400" },
                { label: "Tratamiento",   value: animals.tratamiento, color: "bg-orange-400" },
                { label: "Adoptado",      value: animals.adoptado,    color: "bg-slate-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-custom-700">{item.label}</span>
                    <span className="text-slate-custom-900 font-medium">{item.value}</span>
                  </div>
                  <ProgressBar
                    value={item.value}
                    total={animals.total}
                    color={item.color}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Adopciones por estado */}
          <div className="rounded-2xl border border-slate-custom-50 bg-cream-50 p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-custom-700">
              Solicitudes por estado
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Pendientes",  value: adoptions.pendiente,  color: "bg-amber-400" },
                { label: "Evaluación",  value: adoptions.evaluacion, color: "bg-blue-400" },
                { label: "Aprobadas",   value: adoptions.aprobado,   color: "bg-emerald-400" },
                { label: "Rechazadas",  value: adoptions.rechazado,  color: "bg-rose-400" },
                { label: "Completadas", value: adoptions.adoptado,   color: "bg-slate-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-custom-700">{item.label}</span>
                    <span className="text-slate-custom-900 font-medium">{item.value}</span>
                  </div>
                  <ProgressBar
                    value={item.value}
                    total={adoptions.total}
                    color={item.color}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="rounded-2xl border border-slate-custom-50 bg-cream-50 p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-custom-700">
              Adopciones recientes
            </h2>
            <Link
              href="/admin/adopciones"
              className="shrink-0 text-xs text-brand-600 hover:text-brand-700 transition"
            >
              Ver todas →
            </Link>
          </div>

          {recent_adoptions.length === 0 ? (
            <p className="text-center text-sm text-slate-custom-700 py-6">
              Sin solicitudes aún.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent_adoptions.map((a) => {
                const badge = ADOPTION_STATUS_BADGE[a.status] ?? {
                  label: a.status,
                  cls: "bg-slate-100 text-slate-custom-700 border-slate-custom-50",
                };
                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-custom-50 bg-slate-custom-50/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-medium text-slate-custom-900 truncate">
                        {a.applicant_name}
                      </p>
                      <p className="text-xs text-slate-custom-700 truncate">
                        {a.animal?.name
                          ? `${a.animal.name} (${a.animal.species})`
                          : `Animal #${a.animal_id}`}{" "}
                        · {new Date(a.created_at!).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                    <span
                      className={`self-start rounded-full border px-3 py-1 text-xs font-medium sm:self-auto ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {[
            {
              href: "/admin/adopciones",
              icon: "📋",
              label: "Ver solicitudes",
              sub: `${adoptions.pendiente} pendientes`,
            },
            {
              href: "/admin/animales",
              icon: "🐾",
              label: "Catálogo de animales",
              sub: `${animals.total} registrados`,
            },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col gap-2 rounded-2xl border border-slate-custom-50 bg-cream-50 p-4 shadow-sm transition hover:border-brand-600 sm:rounded-3xl sm:p-6"
            >
              <span className="text-2xl">{l.icon}</span>
              <p className="font-medium text-slate-custom-900">{l.label}</p>
              <p className="text-xs text-slate-custom-700">{l.sub}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}