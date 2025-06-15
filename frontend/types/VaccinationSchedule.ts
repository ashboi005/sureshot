export type VaccinationSchedule = {
  id: string;
  vaccine_name: string;
  dose_number: number;
  due_date: string;
  administered_date?: string; // Optional because it might not be administered yet
  is_administered: boolean;
  is_overdue: boolean;
  disease_prevented: string;
  notes?: string; // Optional field
}
