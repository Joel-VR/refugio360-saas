import type { Adoption } from "./adoption";

export type DashboardStats = {
  animals: {
    total: number;
    apto: number;
    cuarentena: number;
    tratamiento: number;
    adoptado: number;
  };
  adoptions: {
    total: number;
    pendiente: number;
    evaluacion: number;
    aprobado: number;
    rechazado: number;
    adoptado: number;
  };
  shelters: {
    total: number;
    active: number;
  };
  recent_adoptions: Adoption[];
};
