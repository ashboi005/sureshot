export type VaccineRecord = {
  id: string;
  vaccine_name: string;
  dose_number: number;
  administered_date: Date | string; // Can handle both Date object and ISO string
  doctor_id: string;
  disease_prevented: string;
  notes?: string; // Optional field
};