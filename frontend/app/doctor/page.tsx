"use client"

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { PatientListTable } from "@/components/patient-list-table";
import { VaccinationScheduleTable } from "@/components/vaccination-schedule-table";
import { PatientDetailsCard } from "@/components/patient-details-card";
import { QRScanDialog } from "@/components/qr-scan-dialog";
import QRVaccineAdminDialog from "@/components/qr-vaccine-admin-dialog";
import { VaccinationHistoryTable } from "@/components/doctor-vaccination-history";
import { Patient } from "@/types/Patient";
import { VaccinationSchedule } from "@/types/VaccinationSchedule";
import { VaccineRecord } from "@/types/VaccineRecord";
import { getMyPatients, getVaccinationSchedule, getDueVaccinations, getVaccinationHistory, markVaccineAdministered } from "@/lib/api/doctors";
import { toast } from "sonner";
import useUser from "@/hooks/useUser";

function DoctorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [vaccinationSchedules, setVaccinationSchedules] = useState<VaccinationSchedule[]>([]);
  const [dueVaccinations, setDueVaccinations] = useState<VaccinationSchedule[]>([]);
  const [vaccinationHistory, setVaccinationHistory] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrScanOpen, setQrScanOpen] = useState(false);
  const [qrVaccineAdminOpen, setQrVaccineAdminOpen] = useState(false);
  const [qrScannedData, setQrScannedData] = useState<{ userId?: string, vaccineTemplateId?: string, doseNumber?: string }>({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, error } = useUser();
    // Check if we have QR data from route - /doctor/{user-id}/{vaccine-id}?dose={dose-number}
  useEffect(() => {
    const pathParts = pathname.split('/');
    
    // Check for /doctor/{user_id}/{vaccine_id} pattern
    if (pathParts.length >= 4 && pathParts[1] === 'doctor') {
      const userId = pathParts[2];
      const vaccineTemplateId = pathParts[3];
      const doseNumber = searchParams.get('dose');
      
      if (userId && vaccineTemplateId) {
        setQrScannedData({ 
          userId, 
          vaccineTemplateId,
          doseNumber: doseNumber || undefined
        });
        setQrVaccineAdminOpen(true);
      }
    }
    // Also check query params (from URL)
    else {
      const userId = searchParams.get('user_id');
      const vaccineTemplateId = searchParams.get('vaccine_template_id');
      const doseNumber = searchParams.get('dose');
      
      if (userId && vaccineTemplateId) {
        setQrScannedData({ 
          userId, 
          vaccineTemplateId,
          doseNumber: doseNumber || undefined
        });
        setQrVaccineAdminOpen(true);
      }
    }
  }, [pathname, searchParams]);
  
  useEffect(() => {
    const fetchDoctorDashboardData = async () => {
      try {
        setLoading(true);
        const patientsData = await getMyPatients();
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching doctor's dashboard data:", error);
        toast.error("Failed to load doctor's dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDashboardData();
  }, []);

  const handleViewPatientDetails = async (patientId: string) => {
    try {
      setLoading(true);
      // Find the selected patient from the existing data
      const patient = patients.find(p => p.user_id === patientId);
      
      if (patient) {
        setSelectedPatient(patient);
        
        // Fetch all necessary data for the selected patient
        const [scheduleData, dueData, historyData] = await Promise.all([
          getVaccinationSchedule(patientId),
          getDueVaccinations(patientId),
          getVaccinationHistory(patientId)
        ]);
        
        setVaccinationSchedules(scheduleData);
        setDueVaccinations(dueData);
        setVaccinationHistory(historyData);
        
        // Switch to the patient details tab
        setActiveTab("patient-details");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast.error("Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAdministered = (scheduleId: string) => {
    setQrScanOpen(true);
  };

  const handleQrScanComplete = async (scheduleId: string, notes: string) => {
    if (!selectedPatient || !user) {
      toast.error("Missing patient or doctor information");
      return;
    }
    
    try {
      setLoading(true);
      await markVaccineAdministered(
        scheduleId,
        selectedPatient.user_id,
        user.user_id,
        notes
      );
      
      toast.success("Vaccine marked as administered successfully");
      
      // Refresh the vaccination data
      const [scheduleData, dueData, historyData] = await Promise.all([
        getVaccinationSchedule(selectedPatient.user_id),
        getDueVaccinations(selectedPatient.user_id),
        getVaccinationHistory(selectedPatient.user_id)
      ]);
      
      setVaccinationSchedules(scheduleData);
      setDueVaccinations(dueData);
      setVaccinationHistory(historyData);
    } catch (error) {
      console.error("Error marking vaccine as administered:", error);
      toast.error("Failed to mark vaccine as administered");
    } finally {
      setLoading(false);
    }
  };

  const handleQRVaccineSuccess = () => {
    // Clear scanned data and refresh patient list
    setQrScannedData({});
    
    // Clear URL params if they exist
    if (searchParams.has('user_id') || searchParams.has('vaccine_template_id') ||
        pathname.split('/').length >= 4) {
      router.push('/doctor');
    }
    
    // Refresh the patient list to reflect changes
    getMyPatients()
      .then(patientsData => {
        setPatients(patientsData);
      })
      .catch(error => {
        console.error("Error refreshing patients data:", error);
      });
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
    setActiveTab("dashboard");
  };

  // Calculate dashboard statistics
  const pendingCount = patients.reduce((count, patient) => {
    // In a real app, we'd have data about pending vaccinations per patient
    return count + 1;
  }, 0);

  const overdueCount = patients.reduce((count, patient) => {
    // Similarly, this would be actual overdue vaccinations count
    return count + (Math.random() > 0.7 ? 1 : 0);
  }, 0);

  const vaccineCount = patients.length * 2; // Mock data for administered vaccines
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorDashboardContent />
    </Suspense>
  );
}

// Export default with Suspense boundary
export default function DoctorDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin text-blue-600 mx-auto border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <h2 className="text-2xl font-semibold text-gray-800">Loading Doctor Dashboard</h2>
          <p className="text-gray-600 max-w-md">
            Please wait while we prepare your dashboard...
          </p>
        </div>
      </div>
    }>
      <DoctorDashboardContent />
    </Suspense>
  );
}

