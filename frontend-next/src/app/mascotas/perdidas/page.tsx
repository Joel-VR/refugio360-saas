import { SimplePage } from "@/lib/SimpleViews";
import { LostFoundPublicList } from "@/components/LostFoundPublicList";

export default function LostPetsPage() {
  return (
    <SimplePage title="Mascotas perdidas" description="Publicaciones aprobadas por el super admin. Para publicar una pérdida debes iniciar sesión.">
      <LostFoundPublicList type="perdida" publishHref="/cuenta/mascotas-perdidas/nueva" />
    </SimplePage>
  );
}
