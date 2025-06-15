
"use client"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { VaccinationDrivesTable } from "@/components/vaccination-drive-table"
import { SectionCards } from "@/components/section-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { useEffect, useState } from "react"
import { User } from "@/types/User"
import axios from "axios"
import { VaccinationDrive } from "@/types/VaccinationDrives"
import { VaccineRecord } from "@/types/VaccineRecord"
import { VaccinationHistoryTable } from "@/components/vaccination-records-table"
import useUser from "@/hooks/useUser"
import { VaccinationScheduleTable } from "@/components/vaccination-schedule"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [vaccinationHistory, setVaccinationHistory] = useState<VaccineRecord[]>([])
  const [vaccinationDrives, setVaccinationDrives] = useState<VaccinationDrive[]>([])
  const [loading, setLoading] = useState(true)
  const { user, error } = useUser();
  useEffect(() => {


    const fetchVaccinationHistory = async (userId: string) => {
      try {
        console.log("Fetching vaccination history for user ID:", userId)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/vaccination/history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        )
        setVaccinationHistory(response.data)
      } catch (error) {
        console.error("Error fetching vaccination history:", error)
      }
    }

    const fetchVaccinationDrives = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/active-drives`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        )
        setVaccinationDrives(response.data.drives)
      } catch (error) {
        console.error("Error fetching vaccination drives:", error)
      }
    }

    fetchVaccinationDrives()
    fetchVaccinationHistory(user?.user_id || "")
  }, [user])
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar user={user} />

      <div className="flex flex-1">
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                vaccinesTaken={vaccinationHistory.length}
                vaccinationDrivesUpcoming={vaccinationDrives.length}
                vaccinationsLeft={vaccinationDrives.length}
              />

              <Tabs defaultValue="vaccination-history" className="bg-white rounded-lg shadow-sm p-6 border mx-4 lg:mx-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="vaccination-history">Vaccination History</TabsTrigger>
                  <TabsTrigger value="vaccination-drives">Vaccination Drives</TabsTrigger>
                  <TabsTrigger value="vaccination-schedule">Vaccination Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="vaccination-history" className="mt-6">
                  {user ? (
                    <VaccinationHistoryTable
                      userId={user.user_id}
                    />
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <div className="animate-pulse flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Loading vaccination history...
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="vaccination-schedule" className="mt-6">
                  {user ? (
                    <VaccinationScheduleTable
                      userId={user.user_id}
                    />
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <div className="animate-pulse flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Loading vaccination schedule...
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="vaccination-drives" className="mt-6">
                  {user ? (
                    <VaccinationDrivesTable
                      userId={user.user_id}
                    />
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <div className="animate-pulse flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Loading vaccination drives...
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}