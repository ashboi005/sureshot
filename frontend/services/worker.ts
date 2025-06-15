import axios from 'axios';

interface AdministerVaccinePayload {
  user_id: string;
  vaccination_date: string;
  notes?: string;
}

export const workerApi = {
  /**
   * Get user information by QR code data
   */
  getUserByQR: async (userId: string, driveId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/workers/user-by-qr/${userId}/${driveId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user by QR:', error);
      throw error;
    }
  },

  /**
   * Get the worker ID associated with the current user
   */
  getWorkerIdByUserId: async (userId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/workers/get-worker-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching worker ID:', error);
      throw error;
    }
  },

  /**
   * Get vaccination drives assigned to the current worker
   */
  getMyVaccinationDrives: async (activeOnly: boolean = true, limit: number = 10, skip: number = 0) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/workers/my-drives`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: {
            active_only: activeOnly,
            limit,
            skip,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching worker vaccination drives:', error);
      throw error;
    }
  },

  /**
   * Get worker profile details
   */
  getWorkerProfile: async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/workers/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching worker profile:', error);
      throw error;
    }
  },

  /**
   * Get participants for a vaccination drive
   */
  getDriveParticipants: async (driveId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/workers/drive-participants/${driveId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching drive participants:', error);
      throw error;
    }
  },

  /**
   * Mark a participant as vaccinated in a vaccination drive
   */
  administerDriveVaccine: async (driveId: string, data: AdministerVaccinePayload) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/workers/administer-drive-vaccine/${driveId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error administering vaccine:', error);
      throw error;
    }
  },
};
