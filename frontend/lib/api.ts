const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lusgpt0l4e.execute-api.ap-south-1.amazonaws.com/Prod';

// Helper function to handle authentication errors
const handleAuthError = () => {
  // Clear invalid tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  // Redirect to login
  window.location.href = '/auth/login';
};

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
  medical_council_registration_url: string;
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
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json'
    };  }
  
  // Try both possible token storage keys
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
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
      
      if (response.status === 401) {
        handleAuthError();
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching workers:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        throw error;
      }
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
    try {      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
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
      
      if (response.status === 401) {
        handleAuthError();
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        throw error;
      }
      return { doctors: [], total: 0 };
    }
  },
  async createDoctor(data: CreateDoctorData): Promise<DoctorResponse> {
    try {
      console.log('Creating doctor with data:', data);
      const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Doctor creation failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  },

  async uploadDoctorDocument(doctorId: string, file: File): Promise<UploadResponse> {
    try {      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
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
  },  // Dashboard Management
  async getDashboardStats(): Promise<{
    active_drives: number;
    vaccinations_completed: number;
    active_workers: number;
    upcoming_drives: number;
    active_doctors: number;
  }> {
    try {      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 401) {
        handleAuthError();
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        // If endpoint doesn't exist (405) or other error, return default data
        console.warn(`Dashboard stats endpoint returned ${response.status}, using default values`);
        return {
          active_drives: 0,
          vaccinations_completed: 0,
          active_workers: 0,
          upcoming_drives: 0,
          active_doctors: 0
        };
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        throw error;
      }
      return {
        active_drives: 0,
        vaccinations_completed: 0,
        active_workers: 0,
        upcoming_drives: 0,
        active_doctors: 0
      };
    }
  },
};