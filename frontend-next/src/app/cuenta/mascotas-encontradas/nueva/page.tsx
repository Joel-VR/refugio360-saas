export default function NewFoundPetPage() {
  return (
    <section className="mx-auto grid max-w-3xl gap-5 px-6 py-10">
      <h1 className="text-3xl font-semibold">Reportar mascota encontrada</h1>
      <form className="grid gap-3 rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Zona donde se encontró" />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Tipo o especie" />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Descripción" />
        <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Enviar a revisión</button>
      </form>
    </section>
  );
}
