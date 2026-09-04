import { SimplePage } from "@/lib/SimpleViews";
import { SpinnerOverlay } from "@/components/Spinner";

export default function LoadingAnimalDetail() {
  return (
    <SimplePage title="Cargando ficha..." description="Obteniendo la información del animal">
      <div className="mx-auto max-w-4xl">
        <SpinnerOverlay />
      </div>
    </SimplePage>
  );
}
