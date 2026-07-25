import Link from "next/link";
import { PlaceholderList, SimplePage } from "@/lib/SimpleViews";

export default function FoundPetsPage() {
  return (
    <SimplePage title="Mascotas encontradas" description="Publicaciones aprobadas por super admin. Para reportar un encuentro debes iniciar sesión.">
      <Link href="/login?next=/cuenta/mascotas-encontradas/nueva" className="w-fit rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
        Reportar mascota encontrada
      </Link>
      <PlaceholderList items={["Gato naranja · encontrado en Pillco Marca · aprobado", "Perrita pequeña · encontrada cerca al mercado · aprobada"]} />
    </SimplePage>
  );
}
