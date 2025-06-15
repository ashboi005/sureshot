"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { VaccinationDrivesTable } from "@/components/vaccination-drive-table"
import { SectionCards } from "@/components/section-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import axios from "axios"
import { VaccinationDrive } from "@/types/VaccinationDrives"
import { VaccineRecord } from "@/types/VaccineRecord"
import { VaccinationHistoryTable } from "@/components/vaccination-records-table"
import useUser from "@/hooks/useUser"
import { VaccinationScheduleTable } from "@/components/vaccination-schedule"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

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
        setLoading(false)
      } catch (error) {
        console.error("Error fetching vaccination history:", error)
        setLoading(false)
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

    if (user?.user_id) {
      fetchVaccinationDrives()
      fetchVaccinationHistory(user.user_id)
    }
  }, [user])
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* <motion.div variants={itemVariants}>
        <SectionCards
          vaccinesTaken={vaccinationHistory.length}
          vaccinationDrivesUpcoming={vaccinationDrives.length}
          vaccinationsLeft={vaccinationDrives.length}
        />
      </motion.div> */}

      <motion.div variants={itemVariants} className="mt-6">
        <Tabs 
          defaultValue="vaccination-history" 
          className="bg-[#141414] rounded-lg shadow-xl p-6 border border-[#333] mx-4 lg:mx-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-[#1c1c1c]">
            <TabsTrigger 
              value="vaccination-history" 
              className="data-[state=active]:bg-[#8ed500] data-[state=active]:text-[#141414] text-gray-300"
            >
              Vaccination History
            </TabsTrigger>
            <TabsTrigger 
              value="vaccination-drives"
              className="data-[state=active]:bg-[#8ed500] data-[state=active]:text-[#141414] text-gray-300"
            >
              Vaccination Drives
            </TabsTrigger>
            <TabsTrigger 
              value="vaccination-schedule"
              className="data-[state=active]:bg-[#8ed500] data-[state=active]:text-[#141414] text-gray-300"
            >
              Vaccination Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vaccination-history" className="mt-6 text-white">
            {user && !loading ? (
              <VaccinationHistoryTable
                userId={user.user_id}
              />
            ) : (
              <div className="py-8 text-center text-gray-400">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#8ed500]" />
                  Loading vaccination history...
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vaccination-schedule" className="mt-6 text-white">
            {user && !loading ? (
              <VaccinationScheduleTable
                userId={user.user_id}
              />
            ) : (
              <div className="py-8 text-center text-gray-400">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#8ed500]" />
                  Loading vaccination schedule...
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vaccination-drives" className="mt-6 text-white">
            {user && !loading ? (
              <VaccinationDrivesTable
                userId={user.user_id}
              />
            ) : (
              <div className="py-8 text-center text-gray-400">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#8ed500]" />
                  Loading vaccination drives...
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div variants={itemVariants} className="px-4 lg:px-6 mt-6">
        <ChartAreaInteractive />
      </motion.div>
    </motion.div>
  )
}