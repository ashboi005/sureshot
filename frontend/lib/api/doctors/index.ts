import axios from 'axios';
import { Patient } from '@/types/Patient';
import { VaccinationSchedule } from '@/types/VaccinationSchedule';
import { VaccineRecord } from '@/types/VaccineRecord';
import { getDoctorIdByUserId } from './doctorId';

// Export doctor ID functions
export { getDoctorIdByUserId };

/**
 * Get all patients associated with the logged-in doctor
 */
export const getMyPatients = async (): Promise<Patient[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/doctors/patients`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

/**
 * Get vaccination schedule for a specific patient
 */
export const getVaccinationSchedule = async (patientId: string): Promise<VaccinationSchedule[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vaccination/schedule/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching vaccination schedule:', error);
    return [];
  }
};

/**
 * Get due vaccinations for a specific patient
 */
export const getDueVaccinations = async (patientId: string): Promise<VaccinationSchedule[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vaccination/due/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching due vaccinations:', error);
    return [];
  }
};

/**
 * Get vaccination history for a specific patient
 */
export const getVaccinationHistory = async (patientId: string): Promise<VaccineRecord[]> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vaccination/history/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching vaccination history:', error);
    return [];
  }
};

/**
 * Mark a vaccine as administered for a patient
 */
export const markVaccineAdministered = async (
  scheduleId: string, 
  patientId: string, 
  doctorId: string, 
  notes: string = ""
): Promise<boolean> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/vaccination/administer`, 
      {
        schedule_id: scheduleId,
        patient_id: patientId,
        doctor_id: doctorId,
        notes: notes,
        administered_date: new Date().toISOString().split('T')[0]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error('Error marking vaccine as administered:', error);
    throw error;
  }
};
