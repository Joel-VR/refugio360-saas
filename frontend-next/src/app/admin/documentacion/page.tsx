import Link from "next/link";

const GUIDES = [
  {
    title: "Cómo configurar métodos de pago Yape/Plin",
    body: "Entra a Albergues, edita tu refugio y usa la sección Métodos de Pago. Registra un número peruano de 9 dígitos, titular de la cuenta y QR. Debe existir al menos Yape o Plin configurado para recibir donaciones públicas.",
  },
  {
    title: "Cómo gestionar donaciones",
    body: "Abre Donaciones en el panel. Revisa pendientes por comprobante, monto y código de operación. Aprueba si coincide o rechaza seleccionando un motivo claro para que quede guardado en notas administrativas.",
  },
  {
    title: "Cómo descargar reportes",
    body: "En Donaciones aplica filtros de estado, búsqueda o fechas y pulsa Descargar Reporte CSV. El archivo puede abrirse en Excel o Google Sheets.",
  },
  {
    title: "Cómo interpretar transparencia",
    body: "La página pública de transparencia muestra solo donaciones aprobadas y gastos aprobados. El balance es ingresos menos gastos y la distribución agrupa gastos por alimentación, veterinaria, infraestructura y otros.",
  },
];

export default function AdminDocumentationPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] px-6 py-10 text-slate-100">
      <section className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Ayuda</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Documentación para administrador</h1>
          </div>
          <Link href="/admin/dashboard" className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-cream-50/10">Volver</Link>
        </div>
        <div className="grid gap-4">
          {GUIDES.map((guide) => (
            <article key={guide.title} className="rounded-2xl border border-white/10 bg-cream-50/5 p-6">
              <h2 className="text-xl font-semibold">{guide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{guide.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
