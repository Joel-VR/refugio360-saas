import Link from "next/link";
import { getShelters } from "@/lib/api";
import ShelterActions from "./ShelterActions";

export default async function SheltersPage() {
  let shelters;
  let errorMsg: string | null = null;

  try {
    shelters = await getShelters();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Error desconocido";
  }

  if (errorMsg || !shelters) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020617] px-6 text-center">
        <p className="text-4xl">⚠️</p>
        <p className="text-lg font-semibold text-rose-300">Error al cargar albergues</p>
        <p className="max-w-md text-sm text-slate-400">{errorMsg}</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-cream-50/5 p-4 text-left text-xs text-slate-400 font-mono w-full max-w-md">
          <p className="text-slate-500 mb-1">Verifica:</p>
          <p>1. Laravel corriendo: <span className="text-cyan-400">php artisan serve</span></p>
          <p>2. Archivo <span className="text-cyan-400">.env.local</span> en la raíz del frontend</p>
          <p>3. <span className="text-cyan-400">ShelterController.php</span> copiado en app/Http/Controllers/Api/</p>
          <p>4. <span className="text-cyan-400">api.php</span> con las rutas de albergues</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="mt-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-cream-50/10 transition"
        >
          ← Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1f2937,_#0f172a_55%,_#020617)] px-6 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-6xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-cream-50/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Admin</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                Gestión de albergues
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {shelters.length} registrados ·{" "}
                {shelters.filter((s) => s.is_active).length} activos
              </p>
            </div>
            <Link
              href="/admin/albergues/nuevo"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-custom-900 transition hover:bg-cyan-300"
            >
              + Nuevo albergue
            </Link>
          </div>
        </div>

        {/* Empty state */}
        {shelters.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-cream-50/5 p-16 text-center">
            <p className="text-3xl">🏠</p>
            <p className="mt-4 text-slate-400">
              No hay albergues registrados aún.
            </p>
            <Link
              href="/admin/albergues/nuevo"
              className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-custom-900 hover:bg-cyan-300 transition"
            >
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-cream-50/5 overflow-hidden backdrop-blur">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Albergue
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Contacto
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Animales
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Adopciones
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Estado
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shelters.map((shelter, i) => (
                    <tr
                      key={shelter.id}
                      className={`border-b border-white/5 transition hover:bg-cream-50/5 ${
                        i === shelters.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-100">
                            {shelter.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            /{shelter.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-0.5 text-slate-400 text-xs">
                          {shelter.email && <span>{shelter.email}</span>}
                          {shelter.phone && <span>{shelter.phone}</span>}
                          {!shelter.email && !shelter.phone && (
                            <span className="text-slate-custom-700">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-slate-200">
                          {shelter.animals_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-slate-200">
                          {shelter.adoptions_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {shelter.is_active ? (
                          <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-block rounded-full border border-slate-400/30 bg-slate-400/10 px-3 py-1 text-xs text-slate-400">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ShelterActions shelter={shelter} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
