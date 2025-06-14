import axios from "axios";
import { Patient } from "@/types/Patient";
import { VaccinationSchedule } from "@/types/VaccinationSchedule";
import { VaccineRecord } from "@/types/VaccineRecord";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get all patients linked to the current doctor
 */
export async function getMyPatients(): Promise<Patient[]> {
  try {
    const response = await axios.get(`${API_URL}/doctors/my-patients`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    throw error;
  }
}

/**
 * Get vaccination schedule for a specific patient
 */
export async function getVaccinationSchedule(userId: string): Promise<VaccinationSchedule[]> {
  try {
    const response = await axios.get(`${API_URL}/vaccination/schedule/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching vaccination schedule for patient ${userId}:`, error);
    throw error;
  }
}

/**
 * Get vaccination history (administered vaccines) for a specific patient
 */
export async function getVaccinationHistory(userId: string): Promise<VaccineRecord[]> {
  try {
    const response = await axios.get(`${API_URL}/vaccination/history/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching vaccination history for patient ${userId}:`, error);
    throw error;
  }
}

/**
 * Get pending/overdue vaccinations for a specific patient
 */
export async function getDueVaccinations(userId: string): Promise<VaccinationSchedule[]> {
  try {
    const response = await axios.get(`${API_URL}/vaccination/due/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching due vaccinations for patient ${userId}:`, error);
    throw error;
  }
}

/**
 * Mark a vaccine as administered
 */
export async function markVaccineAdministered(
  scheduleId: string, 
  userId: string,
  doctorId: string,
  notes?: string
): Promise<void> {
  try {
    await axios.post(
      `${API_URL}/vaccination/administer`,
      {
        schedule_id: scheduleId,
        user_id: userId,
        doctor_id: doctorId,
        notes: notes || "",
        administered_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
  } catch (error) {
    console.error(`Error marking vaccine as administered:`, error);
    throw error;
  }
}

/**
 * Administer a vaccine directly from QR code data
 */
export async function administeredVaccineByQR(
  userId: string,
  vaccineTemplateId: string,
  doctorId: string,
  doseNumber: number,
  notes?: string
): Promise<void> {
  try {
    const administerData = {
      user_id: userId,
      vaccine_template_id: vaccineTemplateId,
      dose_number: doseNumber,
      doctor_id: doctorId,
      administered_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      notes: notes || ""
    };

    await axios.post(
      `${API_URL}/vaccination/administer`,
      administerData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error administering vaccine from QR:", error);
    throw error;
  }
}
