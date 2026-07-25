import { PublicShell } from '@/lib/SimpleViews'

export default function HomePage() {
  return (
    <PublicShell>
      <section className='mx-auto grid max-w-6xl gap-10 px-6 py-14'>
        <div className='grid gap-5'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-teal-700'>Refugio360</p>
          <h1 className='max-w-3xl text-5xl font-semibold tracking-tight'>
            Plataforma para refugios, adopciones y reportes de mascotas
          </h1>
          <p className='max-w-2xl text-base leading-7 text-slate-600'>
            Visitantes visualizan refugios, animales, transparencia y publicaciones aprobadas. Para donar, publicar o
            solicitar adopción se requiere registro.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          {[
            ['Visitantes', 'Visualizan refugios, animales, transparencia y mascotas perdidas/encontradas aprobadas.'],
            ['Personas', 'Donan, solicitan adopciones y publican mascotas perdidas o encontradas.'],
            ['Albergues', 'Gestionan animales, adopciones, donaciones, transparencia y configuración.'],
          ].map(([title, body]) => (
            <article key={title} className='rounded-lg border border-slate-200 bg-white p-5'>
              <h2 className='text-xl font-semibold'>{title}</h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{body}</p>
            </article>
          ))}
        </div>

        <section className='rounded-lg border border-slate-200 bg-white p-5'>
          <h2 className='text-xl font-semibold'>Contacto y organizaciones</h2>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Espacio simple para contacto institucional, aliados, municipios y organizaciones colaboradoras.
          </p>
        </section>
      </section>
    </PublicShell>
  )
}
