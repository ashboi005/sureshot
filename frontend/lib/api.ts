const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lusgpt0l4e.execute-api.ap-south-1.amazonaws.com/Prod';

// Type definitions based on API schema
export interface WorkerResponse {
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

export interface DoctorResponse {
  id: string;
  user_id: string;
  medical_council_registration_url: string;
  specialization: string;
  hospital_affiliation: string;
  experience_years: number;
  is_active: boolean;
  created_at: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface VaccinationDriveResponse {
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
  assigned_workers: WorkerResponse[];
}

export interface CreateWorkerData {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  city_name: string;
  specialization: string;
  experience_years: number;
}

export interface CreateDoctorData {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  specialization: string;
  hospital_affiliation: string;
  experience_years: number;
}

export interface CreateVaccinationDriveData {
  vaccination_name: string;
  start_date: string;
  end_date: string;
  vaccination_city: string;
  description: string;
  assigned_worker_ids: string[];
}

export interface UploadResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  content_type: string;
  upload_path: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  // Worker Management
  async getWorkers(skip: number = 0, limit: number = 10, city?: string): Promise<{workers: WorkerResponse[], total: number}> {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        ...(city && { city })
      });
      
      const response = await fetch(`${API_BASE_URL}/admin/workers?${params}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching workers:', error);
      return { workers: [], total: 0 };
    }
  },

  async createWorker(data: CreateWorkerData): Promise<WorkerResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/workers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating worker:', error);
      throw error;
    }
  },

  async uploadWorkerDocument(workerId: string, file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/upload/worker-document?worker_id=${workerId}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading worker document:', error);
      throw error;
    }
  },

  // Doctor Management
  async getDoctors(skip: number = 0, limit: number = 10): Promise<{doctors: DoctorResponse[], total: number}> {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString()
      });
      
      const response = await fetch(`${API_BASE_URL}/admin/doctors?${params}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return { doctors: [], total: 0 };
    }
  },

  async createDoctor(data: CreateDoctorData): Promise<DoctorResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  },

  async uploadDoctorDocument(doctorId: string, file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/upload/doctor-document?doctor_id=${doctorId}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading doctor document:', error);
      throw error;
    }
  },

  // Vaccination Drive Management
  async getVaccinationDrives(skip: number = 0, limit: number = 10, city?: string, activeOnly: boolean = true): Promise<{drives: VaccinationDriveResponse[], total: number}> {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        active_only: activeOnly.toString(),
        ...(city && { city })
      });
      
      const response = await fetch(`${API_BASE_URL}/admin/vaccination-drives?${params}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vaccination drives:', error);
      return { drives: [], total: 0 };
    }
  },

  async createVaccinationDrive(data: CreateVaccinationDriveData): Promise<VaccinationDriveResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vaccination-drives`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating vaccination drive:', error);
      throw error;
    }
  }
};