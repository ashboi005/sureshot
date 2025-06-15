import { AssignedWorker } from "./Worker";
import { VaccinationDrive } from "./VaccinationDrives";

export interface WorkerProfile {
  id: string;
  user_id: string;
  city_name: string;
  government_id_url: string;
  specialization: string;
  experience_years: number;
  is_active: boolean;
  created_at: string; 
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface DriveParticipant {
  id: string;
  user_id: string;
  baby_name?: string;
  parent_name?: string;
  parent_mobile?: string;
  address?: string;
  is_vaccinated: boolean;
  vaccination_date?: string;
  worker_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DriveParticipantsResponse {
  participants: DriveParticipant[];
  total: number;
  drive_name: string;
  drive_city: string;
}

export interface AdministerVaccineRequest {
  user_id: string;
  vaccination_date: string;
  notes?: string;
}

export interface AdministerVaccineResponse {
  id: string;
  user_id: string;
  baby_name?: string;
  is_vaccinated: boolean;
  vaccination_date: string;
  worker_id: string;
  notes?: string;
}

export interface WorkerIdResponse {
  user_id: string;
  worker_id: string;
  city_name: string;
  specialization?: string;
  experience_years?: number;
  is_active: boolean;
}

export interface WorkerDrivesResponse {
  drives: VaccinationDrive[];
  total: number;
}
