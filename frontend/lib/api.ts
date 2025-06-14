export interface WorkerResponse {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  city_name: string;
  is_active: boolean;
}

interface VaccinationDriveData {
  vaccination_name: string;
  vaccination_city: string;
  description: string;
  start_date: string;
  end_date: string;
  assigned_worker_ids: string[];
}

export const api = {
  async getWorkers(page: number = 0, limit: number = 50): Promise<{workers: WorkerResponse[]}> {
    try {
      const response = await fetch(`/api/workers?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching workers:', error);
      return { workers: [] };
    }
  },
  
  async createVaccinationDrive(data: VaccinationDriveData): Promise<any> {
    try {
      const response = await fetch('/api/vaccination-drives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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