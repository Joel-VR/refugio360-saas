import { SimplePage } from "@/lib/SimpleViews";
import { LostFoundPublicList } from "@/components/LostFoundPublicList";

export default function FoundPetsPage() {
  return (
    <SimplePage title="Mascotas encontradas" description="Publicaciones aprobadas por el super admin. Para reportar un encuentro debes iniciar sesión.">
      <LostFoundPublicList type="encontrada" publishHref="/cuenta/mascotas-encontradas/nueva" />
    </SimplePage>
  );
}
