import { getCurrentUser, getShelter } from "@/lib/api";
import { getServerAuthHeaders } from "@/lib/server-auth";
import { ShelterProfileForm } from "./ShelterProfileForm";
import { PaymentMethodsPanel } from "./PaymentMethodsPanel";
import { SponsorsPanel } from "./SponsorsPanel";
import { LocationPanel } from "./LocationPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HelpToggle } from "@/components/HelpToggle";

export default async function AdminConfiguracionPage() {
  const { user } = await getCurrentUser(await getServerAuthHeaders());
  const shelter = user.shelter_id ? await getShelter(user.shelter_id) : null;

  if (!shelter) {
    return (
      <main className="px-6 py-10">
        <section className="mx-auto grid max-w-4xl gap-5">
          <h1 className="text-3xl font-semibold text-slate-custom-900">Configuración</h1>
          <div className="rounded-2xl border border-slate-custom-50 bg-slate-custom-50/10 p-6 text-sm text-slate-custom-700">
            No se pudo cargar la información del albergue.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <section className="grid w-full gap-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold text-slate-custom-900">Configuración</h1>
          <HelpToggle label="Ayuda sobre esta página">
            Administra los datos de tu albergue, métodos de pago y preferencias.
          </HelpToggle>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tema */}
          <div className="flex h-full flex-col rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Apariencia</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-custom-900">Tema de la interfaz</h3>
            </div>
            <ThemeToggle />
          </div>

          {/* Perfil del albergue (logo + datos) */}
          <ShelterProfileForm shelter={shelter} />

          {/* Ubicación en el mapa */}
          <LocationPanel shelter={shelter} />

          {/* Métodos de pago */}
          <PaymentMethodsPanel shelter={shelter} />

          {/* Insignias de aliados */}
          <SponsorsPanel shelter={shelter} />
        </div>
      </section>
    </main>
  );
}
