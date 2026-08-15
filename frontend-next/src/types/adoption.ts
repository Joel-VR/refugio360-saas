import type { Animal } from "./animal";

export type AdoptionStatus =
  | "pendiente"
  | "evaluacion"
  | "aprobado"
  | "rechazado"
  | "adoptado";

export type Adoption = {
  id: number;
  shelter_id: number;
  animal_id: number;
  applicant_name: string;
  dni: string;
  phone: string;
  address: string | null;
  status: AdoptionStatus;
  pdf_path: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  animal?: Animal;
  shelter?: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
};

export type CreateAdoptionPayload = {
  shelter_id: number;
  animal_id: number;
  applicant_name: string;
  dni: string;
  phone: string;
  address: string;
  notes?: string;
};