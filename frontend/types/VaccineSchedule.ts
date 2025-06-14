export type VaccineSchedule = {
  id: string;
  vaccine_name: string;
  dose_number: number;
  due_date: string; 
  administered_date: string | null; 
  is_administered: boolean;
  is_overdue: boolean;
  disease_prevented: string;
  notes: string | null;
};