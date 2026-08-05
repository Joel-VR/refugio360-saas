import Link from "next/link";
import { PlaceholderList, SimplePage } from "@/lib/SimpleViews";

export default function LostPetsPage() {
  return (
    <SimplePage title="Mascotas perdidas" description="Publicaciones aprobadas por super admin. Para publicar una pérdida debes iniciar sesión.">
      <Link href="/login?next=/cuenta/mascotas-perdidas/nueva" className="w-fit rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
        Publicar mascota perdida
      </Link>
      <PlaceholderList items={["Luna · perdida en Amarilis · aprobada", "Max · perdido cerca al parque · aprobada"]} />
    </SimplePage>
  );
}
