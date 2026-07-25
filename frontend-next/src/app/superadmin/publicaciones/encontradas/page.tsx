import Link from "next/link";

export default function SuperAdminFoundPostsPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Publicaciones</p>
        <h1 className="mt-2 text-3xl font-semibold">Mascotas encontradas</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Esta sección está lista para integrarse, pero el proyecto todavía no tiene tabla ni API para publicaciones de mascotas encontradas.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Sin solicitudes para revisar</h2>
        <p className="mt-2 text-sm text-slate-400">
          Cuando se implemente el módulo de publicaciones, aquí aparecerán los reportes pendientes con acciones de aprobar y rechazar.
        </p>
        <Link href="/superadmin/dashboard" className="mt-5 inline-block rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
          Volver al dashboard
        </Link>
      </div>
    </section>
  );
}
