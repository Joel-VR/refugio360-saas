import Link from "next/link";
import Image from "next/image";
import { PublicShell } from "@/lib/SimpleViews";

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const DEVELOPERS = [
  "Joel Augusto Vilca Rosas",
  "Jorge Luis Salazar Tarazona",
  "Ericsson Junior Huancaya Recines",
  "Yhozira Milagros Dueñas Loyola",
];

const ROLES = [
  {
    icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    title: "Visitantes",
    body: "Visualizan refugios, animales y transparencia de donaciones.",
  },
  {
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.106A6.375 6.375 0 0012.75 8.5m0 0a4.125 4.125 0 100-8.25 4.125 4.125 0 000 8.25zm-8.25 0a4.125 4.125 0 100-8.25 4.125 4.125 0 000 8.25zM4.5 19.234a12.318 12.318 0 018.25-2.109",
    title: "Personas",
    body: "Donan, solicitan adopciones y publican mascotas perdidas o encontradas.",
  },
  {
    icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
    title: "Albergues",
    body: "Gestionan animales, adopciones, donaciones, transparencia y configuración.",
  },
];

export default function HomePage() {
  return (
    <PublicShell>
      {/* HERO — banner de imagen */}
      <section className="relative h-[300px] md:h-[500px] w-full">
      <Image
    src="/77.png"
    alt="Refugio360"
    fill
    priority
    className="object-cover object-center"
    sizes="100vw"
  />

  {/* Capa de oscurecimiento suave */}
  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

  {/* Contenido superpuesto: Huella + Texto estilizado */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
    <div className="flex flex-col items-center gap-4 max-w-3xl">
      
      {/* Icono de Huella con ligero resplandor */}
      <div className="rounded-full bg-white/10 p-3 backdrop-blur-md border border-white/20 shadow-lg">
        <svg 
          className="h-8 w-8 text-amber-300 drop-shadow md:h-10 md:w-10" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 12c-1.657 0-3 1.567-3 3.5S10.343 19 12 19s3-1.567 3-3.5S13.657 12 12 12zm-4.5-1c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm9 0c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-11-4c.967 0 1.75-.783 1.75-1.75S5.467 3.5 4.5 3.5 2.75 4.283 2.75 5.25 3.533 7 4.5 7zm15 0c.967 0 1.75-.783 1.75-1.75S20.467 3.5 19.5 3.5s-1.75.783-1.75 1.75.783 1.75 1.75 1.75z"/>
        </svg>
      </div>

      {/* Título con letra estilizada y degradado cálido */}
      <h1 className="text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] sm:text-6xl md:text-7xl capitalize">
        Cómplices al rescate
      </h1>

      {/* Subtítulo opcional de apoyo */}
      <p className="text-sm font-medium text-amber-50/90 tracking-widest uppercase md:text-base drop-shadow">
        Uniendo vidas · Salvando huellas
      </p>

    </div>
  </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-600" />
        </div>
      </section>

      {/* TÍTULO + CTA */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-14">            
        <div className="grid gap-5">
      
          <h1 className="max-w-3xl text-3xl md:text-5xl font-semibold tracking-tight">
           ¡Bienvenido a Refugio360!
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-custom-700">
            Explora nuestros refugios aliados, conoce a los peluditos en adopción y mira el impacto real de cada ayuda. Si deseas adoptar, publicar un caso o realizar una donación, solo necesitas crear tu cuenta en un par de clics. ¡Empecemos juntos a cambiar sus vidas!
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/refugios" className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 hover:shadow-md">
              Ver refugios
            </Link>
            <Link href="/donar" className="rounded-full border border-brand-600 px-6 py-3 text-sm font-semibold text-brand-600 transition hover:bg-cream-50">
              Quiero donar
            </Link>
          </div>
        </div>

        {/* CÓMO FUNCIONA */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Cómo funciona</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { step: "1", title: "Explora sin cuenta", body: "Mira refugios, animales disponibles y la transparencia de donaciones, sin registrarte." },
              { step: "2", title: "Regístrate según tu perfil", body: "Elige Persona natural para adoptar o donar, o Albergue si representas una organización." },
              { step: "3", title: "Dona, adopta o publica", body: "Con tu cuenta ya puedes donar, solicitar una adopción o publicar mascotas perdidas/encontradas." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 rounded-lg border border-slate-custom-50 bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-custom-700">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROLES */}
        <div className="grid gap-4 md:grid-cols-3">
          {ROLES.map(({ icon, title, body }) => (
            <article
              key={title}
              className="group rounded-lg border border-slate-custom-50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-md hover:shadow-brand-600/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/10 text-brand-600 transition group-hover:bg-brand-600/15">
                <Icon path={icon} />
              </span>
              <h2 className="mt-3 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-custom-700">{body}</p>
            </article>
          ))}
        </div>

        {/* MISIÓN Y VISIÓN */}
        <div className="grid gap-6 md:grid-cols-2">
          <article className="relative overflow-hidden rounded-2xl border border-slate-custom-50 bg-white p-8">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-600/5" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Misión</p>
            <h2 className="mt-2 text-2xl font-semibold">¿Por qué existe Refugio360?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-custom-700">
              Conectar a los albergues de nuestra ciudad con las personas que quieren adoptar, apoyar o reportar
              mascotas perdidas o encontradas, dando a cada albergue una herramienta simple para mostrar sus animales,
              gestionar sus procesos de adopción y recibir donaciones de forma transparente.
            </p>
          </article>
          <article className="relative overflow-hidden rounded-2xl border border-slate-custom-50 bg-white p-8">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-600/5" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Visión</p>
            <h2 className="mt-2 text-2xl font-semibold">Hacia dónde vamos</h2>
            <p className="mt-3 text-sm leading-7 text-slate-custom-700">
              Convertirnos en la plataforma de referencia para la gestión de albergues y adopción responsable,
              comenzando en nuestra ciudad y con la posibilidad de expandirnos a más ciudades y albergues en el
              futuro, sin perder la transparencia ni la cercanía con la comunidad.
            </p>
          </article>
        </div>

        {/* CONTACTO / ORGANIZACIONES */}
        <section className="rounded-lg border border-slate-custom-50 bg-white p-5">
          <h2 className="text-xl font-semibold">Contacto y organizaciones</h2>
          <p className="mt-2 text-sm leading-6 text-slate-custom-700">
            Proyecto desarrollado en el marco de la Universidad de Huánuco, en colaboración con albergues de animales
            locales, municipios y organizaciones aliadas interesadas en el bienestar animal.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-custom-50 bg-cream-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Contacto institucional</p>
              <div className="mt-3 grid gap-3">
                {[
                  { name: "Joel Augusto Vilca Rosas", email: "joel.vilca@refugio360.pe", phone: "+51 934 217 685" },
                  { name: "Jorge Luis Salazar Tarazona", email: "jorge.salazar@refugio360.pe", phone: "+51 947 802 314" },
                  { name: "Ericsson Junior Huancaya Recines", email: "ericsson.huancaya@refugio360.pe", phone: "+51 918 573 942" },
                  { name: "Yhozira Milagros Dueñas Loyola", email: "yhozira.duenas@refugio360.pe", phone: "+51 956 240 178" },
                ].map((dev) => (
                  <div key={dev.name} className="flex items-start gap-3 rounded-lg border border-slate-custom-50 bg-white px-3 py-2.5">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {dev.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-custom-900">{dev.name}</p>
                      <p className="text-xs text-slate-custom-700">{dev.email}</p>
                      <p className="text-xs text-slate-custom-700">{dev.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-custom-50 bg-cream-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Universidad aliada</p>
              <p className="mt-2 text-sm font-medium text-slate-custom-900">Universidad de Huánuco</p>
              <p className="text-xs text-slate-custom-700">Facultad de Ingeniería — Proyecto Refugio360</p>
              <p className="mt-2 text-sm text-slate-custom-700">proyectos.ingenieria@udh.edu.pe</p>
              <p className="text-sm text-slate-custom-700">+51 (062) 512 700</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Al usar Refugio360 aceptas nuestros{" "}
            <Link href="/terminos-condiciones" className="font-semibold text-brand-600 underline">
              Términos y Condiciones
            </Link>
            .
          </p>
        </section>

        {/* COLABORADORES / DESARROLLADORES */}
        <div className="rounded-2xl border border-slate-custom-50 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Equipo</p>
          <h2 className="mt-2 text-2xl font-semibold">Desarrolladores del sistema</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-custom-700">
            Refugio360 fue diseñado y desarrollado por:
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {DEVELOPERS.map((name) => (
              <li
                key={name}
                className="flex items-center gap-3 rounded-lg border border-slate-custom-50 bg-cream-50 px-4 py-3 text-sm font-medium text-slate-custom-900 transition hover:border-brand-600/30"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicShell>
  );
}