import Link from "next/link";
import { SimplePage } from "@/lib/SimpleViews";

export default function RegisterChooserPage() {
  return (
    <SimplePage title="Elige tipo de registro" description="Las acciones requieren una cuenta para mantener control estadístico y moderación.">
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/registro/persona" className="rounded-lg border border-slate-custom-50 bg-cream-50 p-6">
          <h2 className="text-xl font-semibold">Persona natural</h2>
          <p className="mt-2 text-sm text-slate-custom-700">Para donar, solicitar adopción y publicar mascotas perdidas o encontradas.</p>
        </Link>
        <Link href="/registro/albergue" className="rounded-lg border border-slate-custom-50 bg-cream-50 p-6">
          <h2 className="text-xl font-semibold">Albergue</h2>
          <p className="mt-2 text-sm text-slate-custom-700">Queda pendiente hasta validación del super admin.</p>
        </Link>
      </div>
    </SimplePage>
  );
}
