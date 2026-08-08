import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-8 w-8 text-brand-600">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function RegisterChooserPage() {
  return (
    <SimplePage title="Elige tipo de registro" description="Las acciones requieren una cuenta para mantener control estadístico y moderación.">
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/registro/persona" className="flex flex-col gap-3 rounded-lg border border-slate-custom-50 bg-cream-50 p-6 transition hover:border-brand-600/40 hover:shadow-sm">
          <Icon path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <h2 className="text-xl font-semibold">Persona natural</h2>
          <p className="text-sm text-slate-custom-700">Para adoptantes y donantes individuales. Con esta cuenta puedes:</p>
          <ul className="grid gap-1.5 text-sm text-slate-custom-700">
            <li>✓ Solicitar la adopción de un animal</li>
            <li>✓ Donar a un refugio (Yape o Plin)</li>
            <li>✓ Publicar y ver reportes de mascotas perdidas o encontradas</li>
          </ul>
          <span className="mt-2 inline-block w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Registrarme como persona</span>
        </Link>
        <Link href="/registro/albergue" className="flex flex-col gap-3 rounded-lg border border-slate-custom-50 bg-cream-50 p-6 transition hover:border-brand-600/40 hover:shadow-sm">
          <Icon path="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
          <h2 className="text-xl font-semibold">Albergue</h2>
          <p className="text-sm text-slate-custom-700">Para organizaciones o refugios de animales. Con esta cuenta puedes:</p>
          <ul className="grid gap-1.5 text-sm text-slate-custom-700">
            <li>✓ Publicar tus animales en adopción</li>
            <li>✓ Gestionar solicitudes de adopción</li>
            <li>✓ Recibir donaciones y mostrar transparencia de gastos</li>
          </ul>
          <p className="mt-1 text-xs font-medium text-amber-700">⏳ Tu cuenta queda pendiente hasta que el super admin valide tu refugio.</p>
          <span className="mt-1 inline-block w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Registrar mi albergue</span>
        </Link>
      </div>
      <p className="text-sm text-slate-custom-700">
        ¿No sabes cuál elegir? Si quieres <strong>adoptar o donar</strong>, elige <strong>Persona natural</strong>. Si representas
        una organización que rescata animales, elige <strong>Albergue</strong>.
      </p>
    </SimplePage>
  );
}
