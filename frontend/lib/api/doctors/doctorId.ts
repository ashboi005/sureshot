import axios from 'axios';

interface DoctorDetailsResponse {
  user_id: string;
  doctor_id: string;
  specialization: string;
  hospital_affiliation: string;
}

/**
 * Fetches doctor ID and details for a given user ID
 * @param userId The user ID to look up
 * @returns Doctor details including doctor_id, specialization, and hospital_affiliation
 */
export const getDoctorIdByUserId = async (userId: string): Promise<DoctorDetailsResponse> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get<DoctorDetailsResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/doctors/get-doctor-id/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor ID:', error);
    throw error;
  }
};
