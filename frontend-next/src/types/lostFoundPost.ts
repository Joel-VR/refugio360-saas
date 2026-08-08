export type LostFoundPostType = "perdida" | "encontrada";
export type LostFoundPostStatus = "pending_review" | "approved" | "rejected";

export type LostFoundPost = {
  id: number;
  user_id: number;
  type: LostFoundPostType;
  pet_name: string | null;
  species: string | null;
  zone: string;
  description: string;
  contact_phone: string;
  photo_path: string | null;
  status: LostFoundPostStatus;
  admin_notes: string | null;
  created_at?: string;
  updated_at?: string;
  user?: { id: number; name: string; email?: string };
};

export type CreateLostFoundPostPayload = {
  type: LostFoundPostType;
  pet_name?: string;
  species?: string;
  zone: string;
  description: string;
  contact_phone: string;
  photo?: File | null;
};
