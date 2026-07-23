export type DonationStatus = "pending" | "approved" | "rejected";
export type DonationMethod = "yape" | "plin";
export type DonationKind = "general" | "specific";

export interface DonationAnimal {
  id: number;
  name: string;
  species: string;
}

export interface Donation {
  id: number;
  shelter_id: number;
  shelter?: { id: number; name: string };
  animal_id: number | null;
  animal?: DonationAnimal | null;
  donor_name: string | null;
  donor_email: string | null;
  amount: string | number | null;
  payment_method: DonationMethod;
  operation_reference: string | null;
  voucher_path: string | null;
  notes: string | null;
  status: DonationStatus;
  donation_type: DonationKind;
  is_recurring: boolean;
  is_anonymous: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDonations {
  data: Donation[];
  total: number;
  current_page: number;
  last_page: number;
}
