import Link from "next/link";
import { getDashboardStats } from "@/lib/api";

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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <p className={`text-xs font-semibold uppercase tracking-widest ${color}`}>{label}</p>
      <p className="mt-2 text-4xl font-bold text-slate-100">{value}</p>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
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
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-slate-400">{pct}%</span>
    </div>
  );
}

export default async function DashboardPage() {
  let stats;
  let errorMsg: string | null = null;

  try {
    stats = await getDashboardStats();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Error desconocido";
  }

  if (errorMsg || !stats) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020617] px-6 text-center">
        <p className="text-4xl">⚠️</p>
        <p className="text-lg font-semibold text-rose-300">No se pudo conectar con la API</p>
        <p className="max-w-md text-sm text-slate-400">
          {errorMsg}
        </p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs text-slate-400 font-mono w-full max-w-md">
          <p className="text-slate-500 mb-1">Verifica:</p>
          <p>1. Laravel corriendo: <span className="text-cyan-400">php artisan serve</span></p>
          <p>2. URL en <span className="text-cyan-400">.env.local</span>: <span className="text-slate-300">NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1</span></p>
          <p>3. Migración: <span className="text-cyan-400">php artisan migrate</span></p>
          <p>4. CORS activo en Laravel</p>
        </div>
      </div>
    );
  }

  const { animals, adoptions, shelters, recent_adoptions } = stats;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-6xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Admin</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/albergues/nuevo"
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              + Albergue
            </Link>
            <Link
              href="/admin/animales/nuevo"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              + Animal
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Animales totales" value={animals.total} color="text-cyan-300" />
          <StatCard
            label="Disponibles"
            value={animals.apto}
            sub="Listos para adopción"
            color="text-emerald-300"
          />
          <StatCard label="Adopciones" value={adoptions.total} color="text-violet-300" />
          <StatCard
            label="Albergues"
            value={shelters.total}
            sub={`${shelters.active} activos`}
            color="text-amber-300"
          />
        </div>

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Animales por estado */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
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
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-slate-400 font-medium">{item.value}</span>
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
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
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
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-slate-400 font-medium">{item.value}</span>
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
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Adopciones recientes
            </h2>
            <Link
              href="/admin/adopciones"
              className="text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              Ver todas →
            </Link>
          </div>

          {recent_adoptions.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">
              Sin solicitudes aún.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent_adoptions.map((a) => {
                const badge = ADOPTION_STATUS_BADGE[a.status] ?? {
                  label: a.status,
                  cls: "bg-slate-400/10 text-slate-400 border-slate-400/30",
                };
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-slate-200">
                        {a.applicant_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.animal?.name
                          ? `${a.animal.name} (${a.animal.species})`
                          : `Animal #${a.animal_id}`}{" "}
                        · {new Date(a.created_at!).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${badge.cls}`}
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
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/admin/albergues",
              icon: "🏠",
              label: "Gestionar albergues",
              sub: `${shelters.total} registrados`,
            },
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
              className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
            >
              <span className="text-2xl">{l.icon}</span>
              <p className="font-medium text-slate-200">{l.label}</p>
              <p className="text-xs text-slate-500">{l.sub}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
