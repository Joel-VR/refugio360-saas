export type AnimalPhoto = {
  id: number;
  animal_id: number;
  photo_path: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};

export type Animal = {
  id: number;
  shelter_id: number;
  name: string;
  species: string;
  estimated_age: number | null;
  health_status: string | null;
  is_sterilized: boolean;
  lifecycle_status: string;
  created_at?: string;
  updated_at?: string;
  photos?: AnimalPhoto[];
  shelter?: { id: number; name: string; slug: string };
};
