"use client";

import { useParams } from "next/navigation";
import { RoleGate } from "@/lib/RoleGate";
import { SimplePage } from "@/lib/SimpleViews";

export default function AdoptAnimalProtectedPage() {
  const { animalId } = useParams<{ animalId: string }>();
  return (
    <RoleGate allow={["natural_person"]}>
      <SimplePage title="Solicitud de adopción" description={`Formulario simple para solicitar adopción del animal #${animalId}.`}>
        <form className="grid max-w-lg gap-3 rounded-lg border border-slate-custom-50 bg-cream-50 p-5">
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Teléfono" />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Dirección" />
          <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Motivo de adopción" />
          <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Enviar solicitud</button>
        </form>
      </SimplePage>
    </RoleGate>
  );
}
