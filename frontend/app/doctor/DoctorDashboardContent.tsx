"use client"

import { useEffect, useState } from 'react';
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

export function DoctorDashboardContent() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar user={user || undefined} />
      
      <div className="container mx-auto p-4 pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
            <Button 
              onClick={() => setQrScanOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0v7m0-7h-6m6 0l-4-4m0 0l4-4m-4 4h12" />
              </svg>
              Scan Vaccine QR
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="dashboard" className="py-3">Dashboard</TabsTrigger>
              <TabsTrigger value="patients" className="py-3">Patients</TabsTrigger>
              <TabsTrigger value="patient-details" disabled={!selectedPatient} className="py-3">
                Patient Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white shadow-md border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Total Patients</CardTitle>
                    <CardDescription>Your registered patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{patients.length}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {patients.length > 0 ? '+2 this month' : 'No patients yet'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-md border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Pending Vaccinations</CardTitle>
                    <CardDescription>Scheduled for this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {overdueCount > 0 ? `${overdueCount} overdue` : 'All on schedule'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-md border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Vaccines Administered</CardTitle>
                    <CardDescription>Total count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{vaccineCount}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {vaccineCount > 5 ? '+3 this week' : 'Just getting started'}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 bg-white shadow-md border-none">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                    <CardDescription>Your latest patient interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-4 p-3 rounded-lg border border-gray-100 bg-gray-50">
                          <div className={`p-2 rounded-full ${
                            i === 0 ? 'bg-green-100 text-green-600' : 
                            i === 1 ? 'bg-blue-100 text-blue-600' : 
                            'bg-amber-100 text-amber-600'
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {i === 0 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : i === 1 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              )}
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {i === 0
                                ? 'Vaccine administered to Emily Johnson'
                                : i === 1
                                ? 'Appointment scheduled with Noah Smith'
                                : 'Vaccination reminder sent to Olivia Wilson'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {i === 0 ? '2 hours ago' : i === 1 ? 'Yesterday' : '2 days ago'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-md border-none">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Vaccination Summary</CardTitle>
                    <CardDescription>Monthly statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Polio</span>
                          <span className="text-sm font-medium">12</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Measles</span>
                          <span className="text-sm font-medium">8</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Hepatitis B</span>
                          <span className="text-sm font-medium">15</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">BCG</span>
                          <span className="text-sm font-medium">10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-white shadow-md border-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Recent Patients</CardTitle>
                  <CardDescription>Patients you recently interacted with</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-pulse flex flex-col gap-3 w-full">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-12 bg-gray-200 rounded-md w-full" />
                        ))}
                      </div>
                    </div>
                  ) : patients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {patients.slice(0, 5).map((patient) => (
                            <tr key={patient.user_id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{patient.baby_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {patient.baby_date_of_birth ? new Date().getFullYear() - new Date(patient.baby_date_of_birth).getFullYear() : 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                              </td>
                              <td className="px-4 py-3">
                                <Button variant="ghost" size="sm" onClick={() => handleViewPatientDetails(patient.user_id)}>
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {patients.length > 5 && (
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => setActiveTab("patients")}>
                            View All Patients
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No patients found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="patients" className="space-y-4 mt-2">              
              <div className="mt-4">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-pulse">Loading patient data...</div>
                  </div>
                ) : (
                  <PatientListTable 
                    patients={patients}
                    onViewDetails={handleViewPatientDetails}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="patient-details" className="space-y-4 mt-2">
              {selectedPatient && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Patient Details</h2>
                    <Button variant="outline" onClick={handleBackToPatients}>
                      Back to Dashboard
                    </Button>
                  </div>
                  
                  <PatientDetailsCard patient={selectedPatient} />
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">Vaccination Schedule</h3>
                      <Button 
                        onClick={() => setQrScanOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <svg 
                          className="w-5 h-5 mr-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0v7m0-7h-6m6 0l-4-4m0 0l4-4m-4 4h12" />
                        </svg>
                        Scan Vaccine QR
                      </Button>
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-pulse">Loading vaccination data...</div>
                      </div>
                    ) : (
                      <VaccinationScheduleTable 
                        schedules={vaccinationSchedules}
                        onMarkAdministered={handleMarkAdministered}
                      />
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Pending/Overdue Vaccinations</h3>
                    {loading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-pulse">Loading due vaccinations...</div>
                      </div>
                    ) : (
                      <VaccinationScheduleTable 
                        schedules={dueVaccinations.filter(v => !v.is_administered)}
                        onMarkAdministered={handleMarkAdministered}
                      />
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Vaccination History</h3>
                    {selectedPatient && (
                      <VaccinationHistoryTable userId={selectedPatient.user_id} />
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <QRScanDialog 
        open={qrScanOpen}
        onOpenChange={setQrScanOpen}
        onScanComplete={handleQrScanComplete}
      />
      <QRVaccineAdminDialog 
        open={qrVaccineAdminOpen}
        onOpenChange={setQrVaccineAdminOpen}
        onSuccess={handleQRVaccineSuccess}
        userId={qrScannedData.userId}
        vaccineTemplateId={qrScannedData.vaccineTemplateId}
        doseNumber={qrScannedData.doseNumber}
      />
    </div>
  );
}
