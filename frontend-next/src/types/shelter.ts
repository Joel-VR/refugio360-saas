export type Shelter = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  logo_path: string | null;
  is_active: boolean;
  animals_count?: number;
  adoptions_count?: number;
  stats?: {
    animals_apto: number;
    animals_cuarentena: number;
    animals_tratamiento: number;
    animals_adoptado: number;
    adoptions_pendiente: number;
    adoptions_aprobado: number;
  };
  created_at?: string;
  updated_at?: string;
};

export type CreateShelterPayload = {
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
};
