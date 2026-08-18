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
    <main className="px-4 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600 sm:text-sm">Ayuda</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-custom-900 sm:text-4xl">Documentación para administrador</h1>
          </div>
          <Link
            href="/admin/dashboard"
            className="self-start rounded-full border border-slate-custom-50 px-4 py-2 text-sm text-slate-custom-700 hover:bg-slate-custom-50 sm:self-auto"
          >
            Volver
          </Link>
        </div>
        <div className="grid gap-4">
          {GUIDES.map((guide) => (
            <article key={guide.title} className="rounded-2xl border border-slate-custom-50 bg-cream-50 p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-custom-900 sm:text-xl">{guide.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-custom-700 sm:leading-7">{guide.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}