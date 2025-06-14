import { AssignedWorker } from './Worker';
export type VaccinationDrive = {
  id: string;
  vaccination_name: string;
  start_date: string; 
  end_date: string;
  vaccination_city: string;
  description: string;
  is_active: boolean;
  created_by: string;
  created_at: string; 
  updated_at: string; 
  assigned_workers: AssignedWorker[];
};


type VaccinationDrivesResponse = {
  drives: VaccinationDrive[];
  total: number;
  user_city: string;
};