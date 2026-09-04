export type ShelterSponsor = {
  id: number;
  name: string;
  logo_path: string;
  url: string | null;
};

export type Shelter = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  logo_path: string | null;
  is_active: boolean;
  approval_status?: "pending_review" | "approved" | "rejected";
  users?: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    status?: boolean;
    shelter_id: number | null;
  }>;
  yape_phone?: string | null;
  yape_owner?: string | null;
  yape_qr_path?: string | null;
  plin_phone?: string | null;
  plin_owner?: string | null;
  plin_qr_path?: string | null;
  accepts_donations?: boolean;
  payment_methods?: {
    yape: { enabled: boolean; phone: string | null; owner: string | null; qr_path: string | null };
    plin: { enabled: boolean; phone: string | null; owner: string | null; qr_path: string | null };
  };
  animals_count?: number;
  adoptions_count?: number;
  sponsors?: ShelterSponsor[];
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
  address?: string;
  is_active?: boolean;
  yape_phone?: string;
  yape_owner?: string;
  plin_phone?: string;
  plin_owner?: string;
};
