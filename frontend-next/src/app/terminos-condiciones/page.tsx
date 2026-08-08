import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";

export const metadata = { title: "Términos y Condiciones — Refugio360" };

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Qué es Refugio360",
    body: (
      <p>
        Refugio360 es una plataforma que conecta a múltiples albergues de animales de la ciudad con personas
        interesadas en adoptar, donar o reportar mascotas perdidas o encontradas. Cada albergue gestiona de forma
        independiente su propia información dentro de la plataforma.
      </p>
    ),
  },
  {
    title: "Tipos de cuenta y roles",
    body: (
      <>
        <p>Existen distintos niveles de acceso:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><b>Visitante (sin cuenta):</b> puede ver albergues, animales publicados y transparencia de donaciones.</li>
          <li><b>Persona registrada:</b> puede solicitar adopciones, donar, y publicar reportes de mascotas perdidas o encontradas.</li>
          <li><b>Administrador de albergue:</b> gestiona los animales, solicitudes de adopción y donaciones de su propio albergue.</li>
          <li><b>Super administrador:</b> rol reservado para el equipo desarrollador de Refugio360, con acceso a la administración general de la plataforma.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Publicación de animales por los albergues",
    body: (
      <p>
        Cada albergue es responsable de la veracidad de la información que publica sobre sus animales: especie,
        raza, sexo, estado de salud, vacunas y estado de disponibilidad (en cuarentena, no disponible o disponible
        para adopción). Refugio360 no verifica de forma independiente cada dato publicado por los albergues.
      </p>
    ),
  },
  {
    title: "Publicaciones de mascotas perdidas y encontradas",
    body: (
      <p>
        Cualquier persona registrada puede publicar un reporte de mascota perdida o encontrada. Esta información es
        proporcionada directamente por el usuario y bajo su responsabilidad. Refugio360 no garantiza la veracidad de
        estos reportes ni actúa como intermediario en la recuperación del animal; solo facilita la visibilidad de la
        publicación, y cada reporte pasa por una revisión del super administrador antes de publicarse.
      </p>
    ),
  },
  {
    title: "Solicitudes de adopción",
    body: (
      <p>
        Al enviar una solicitud de adopción, el usuario proporciona datos de contacto e información personal que
        serán compartidos con el albergue correspondiente para evaluar la solicitud. La decisión final de aprobar o
        rechazar una adopción corresponde exclusivamente al albergue, no a Refugio360.
      </p>
    ),
  },
  {
    title: "Donaciones",
    body: (
      <>
        <p>
          Las donaciones se realizan de forma directa entre el donante y el albergue, mediante transferencia a un
          número de teléfono (Yape, Plin u otro medio) publicado por cada albergue. Refugio360 no procesa ni retiene
          fondos: actúa únicamente como registro y verificación del comprobante de pago que el donante sube a la
          plataforma.
        </p>
        <p className="mt-2">
          Cada donación debe ser validada manualmente por el albergue receptor (aprobada o rechazada) antes de
          considerarse confirmada. El usuario es responsable de que los datos de la transferencia (monto, código de
          operación, comprobante) sean correctos y legibles.
        </p>
      </>
    ),
  },
  {
    title: "Transparencia",
    body: (
      <p>
        Cada albergue puede publicar información sobre el uso de las donaciones recibidas (gastos, reportes) con
        fines de transparencia. Esta información es responsabilidad del albergue que la publica.
      </p>
    ),
  },
  {
    title: "Datos personales",
    body: (
      <p>
        Los datos personales proporcionados (nombre, correo, teléfono, DNI en el caso de solicitudes de adopción) se
        usan únicamente para los fines de la plataforma: gestionar adopciones, donaciones y reportes. No se venden ni
        comparten con terceros ajenos al albergue correspondiente.
      </p>
    ),
  },
  {
    title: "Responsabilidad de la plataforma",
    body: (
      <p>
        Refugio360 es una herramienta de conexión e intermediación de información entre albergues y personas. No es
        responsable de: la salud o comportamiento de los animales publicados, el resultado de una adopción, el uso
        que un albergue dé a las donaciones recibidas, ni la veracidad de las publicaciones de mascotas perdidas o
        encontradas hechas por personas naturales.
      </p>
    ),
  },
  {
    title: "Expansión y disponibilidad del servicio",
    body: (
      <p>
        Refugio360 inicia operando con albergues de una sola ciudad, con la posibilidad de expandirse a más ciudades
        o regiones en el futuro. Estos Términos aplican a todos los albergues y usuarios registrados, sin importar la
        ciudad en la que operen.
      </p>
    ),
  },
  {
    title: "Modificaciones a estos términos",
    body: (
      <p>
        Refugio360 puede actualizar estos Términos y Condiciones en cualquier momento. Los cambios relevantes se
        notificarán dentro de la plataforma. El uso continuado del sistema después de una actualización implica la
        aceptación de los nuevos términos.
      </p>
    ),
  },
  {
    title: "Contacto",
    body: (
      <p>
        Para consultas sobre estos términos, comunícate a través de la sección de{" "}
        <Link href="/#contacto" className="font-semibold text-brand-600 underline">Contacto y organizaciones</Link>{" "}
        en la página principal.
      </p>
    ),
  },
];

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div id={`s${number}`} className="scroll-mt-24 flex gap-4">
      <div className="flex flex-shrink-0 flex-col items-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-600 bg-white text-sm font-bold text-brand-600">
          {number}
        </span>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-slate-custom-50 bg-white p-6 transition hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5">
        <h2 className="text-lg font-semibold text-slate-custom-900">{title}</h2>
        <div className="mt-2 space-y-2 text-sm leading-6 text-slate-custom-700">{children}</div>
      </div>
    </div>
  );
}

export default function TerminosPage() {
  return (
    <SimplePage
      eyebrow="Legal"
      title="Términos y Condiciones"
      description="Última actualización: agosto de 2026. Al registrarte o usar Refugio360 aceptas lo siguiente."
    >
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Índice fijo */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-custom-50 bg-cream-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Índice</p>
            <ul className="mt-3 space-y-1">
              {SECTIONS.map((s, i) => (
                <li key={s.title}>
                  <Link
                    href={`#s${i + 1}`}
                    className="block rounded-lg px-2 py-1.5 text-xs font-medium text-slate-custom-700 transition hover:bg-white hover:text-brand-600"
                  >
                    {i + 1}. {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Índice móvil */}
        <div className="rounded-2xl border border-slate-custom-50 bg-cream-50 p-5 lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Índice</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SECTIONS.map((s, i) => (
              <Link
                key={s.title}
                href={`#s${i + 1}`}
                className="rounded-full border border-slate-custom-50 bg-white px-3 py-1.5 text-xs font-medium text-slate-custom-700 transition hover:border-brand-600/40 hover:text-brand-600"
              >
                {i + 1}. {s.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Contenido con línea de tiempo */}
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 hidden w-px bg-slate-custom-50 sm:block" />
          <div className="grid gap-6">
            {SECTIONS.map((s, i) => (
              <Section key={s.title} number={i + 1} title={s.title}>
                {s.body}
              </Section>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-600/20 bg-brand-600/5 p-6 text-center">
        <p className="text-sm text-slate-custom-700">
          Gracias por ser parte de la comunidad Refugio360.
        </p>
      </div>
    </SimplePage>
  );
}