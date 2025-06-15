import { api } from "@/lib/api"

export interface AdminDashboardStats {
  active_drives: number;
  vaccinations_completed: number;
  active_workers: number;
  upcoming_drives: number;
  active_doctors: number;
}

class AdminApiService {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      // Initialize default stats
      let activeDrives = 0
      let upcomingDrives = 0
      let activeWorkers = 0
      let activeDoctors = 0
      const vaccinationsCompleted = 0 // TODO: Implement when vaccination records API is available      // Fetch drives data with error handling
      try {
        const drivesResponse = await api.getVaccinationDrives(0, 50, undefined, false) // Get all drives, not just active ones
        const drives = drivesResponse.drives || []
        const now = new Date()
        
        // Calculate active drives (currently running and active)
        activeDrives = drives.filter(drive => {
          const startDate = new Date(drive.start_date)
          const endDate = new Date(drive.end_date)
          return now >= startDate && now <= endDate && drive.is_active
        }).length

        // Calculate upcoming drives (planned for future and active)
        upcomingDrives = drives.filter(drive => {
          const startDate = new Date(drive.start_date)
          return now < startDate && drive.is_active
        }).length
      } catch (error) {
        console.warn('Failed to fetch drives data:', error)
      }

      // Fetch workers data with error handling
      try {
        const workersResponse = await api.getWorkers(0, 50) // Reduced batch size
        activeWorkers = (workersResponse.workers || []).filter(worker => worker.is_active).length
      } catch (error) {
        console.warn('Failed to fetch workers data:', error)
      }

      // Fetch doctors data with error handling
      try {
        const doctorsResponse = await api.getDoctors(0, 50) // Reduced batch size
        activeDoctors = (doctorsResponse.doctors || []).filter(doctor => doctor.is_active).length
      } catch (error) {
        console.warn('Failed to fetch doctors data:', error)
      }      return {
        active_drives: activeDrives,
        vaccinations_completed: vaccinationsCompleted,
        active_workers: activeWorkers,
        upcoming_drives: upcomingDrives,
        active_doctors: activeDoctors
      }
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error)
      // Return default values on error
      return {
        active_drives: 0,
        vaccinations_completed: 0,
        active_workers: 0,
        upcoming_drives: 0,
        active_doctors: 0
      }
    }
  }
}

export const adminApi = new AdminApiService()
