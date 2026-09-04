export const LIFECYCLE_STATUS_LABELS: Record<string, string> = {
  apto: "Disponible para adopción",
  cuarentena: "En cuarentena",
  tratamiento: "En tratamiento médico",
  adoptado: "Adoptado",
};

type ShareableAnimal = {
  name: string;
  species: string;
  estimated_age: number | null;
  lifecycle_status: string;
  shelter?: { name: string } | null;
};

export function buildAnimalShareText(animal: ShareableAnimal): string {
  const details = [
    `Especie: ${animal.species}`,
    animal.estimated_age != null ? `Edad: ${animal.estimated_age} meses` : null,
    `Estado: ${LIFECYCLE_STATUS_LABELS[animal.lifecycle_status] ?? animal.lifecycle_status}`,
    animal.shelter?.name ? `Albergue: ${animal.shelter.name}` : null,
  ].filter(Boolean);

  return `Ayuda a ${animal.name} a encontrar un hogar 🐾 ${details.join(" · ")}`;
}
