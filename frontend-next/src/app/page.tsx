import { PublicShell } from '@/lib/SimpleViews'
import Image from "next/image";
export default function HomePage() {
  return (
    <PublicShell>
      <section className="relative aspect-video w-full">
        <Image
          src="/hero.jpg"
          alt="Refugio360"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      

        

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6">
          </div>
        </div>
      </section>
      <section className='mx-auto grid max-w-6xl gap-10 px-4 md:px-6 py-10 md:py-14'>
        <div className='grid gap-5'>
          <h1 className='max-w-3xl text-3xl md:text-5xl font-semibold tracking-tight'>
            Plataforma para refugios, adopciones y reportes de mascotas
          </h1>
          <p className='max-w-2xl text-base leading-7 text-slate-custom-700'>
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
            <article key={title} className='rounded-lg border border-slate-custom-50 bg-white p-5'>
              <h2 className='text-xl font-semibold'>{title}</h2>
              <p className='mt-2 text-sm leading-6 text-slate-custom-700'>{body}</p>
            </article>
          ))}
        </div>

        <section className='rounded-lg border border-slate-custom-50 bg-white p-5'>
          <h2 className='text-xl font-semibold'>Contacto y organizaciones</h2>
          <p className='mt-2 text-sm leading-6 text-slate-custom-700'>
            Espacio simple para contacto institucional, aliados, municipios y organizaciones colaboradoras.
          </p>
        </section>
      </section>
    </PublicShell>
  )
}
