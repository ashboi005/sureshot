"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { workerApi } from "@/services/worker";
import { Loader2, Users, Syringe, FileCheck, CalendarClock } from "lucide-react";
import { VaccinationDrive } from "@/types/VaccinationDrives";

interface WorkerStat {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
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

export function WorkerStatCards() {
  const [stats, setStats] = useState<WorkerStat[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch drives to calculate stats
        const drivesData = await workerApi.getMyVaccinationDrives(false);
          // Calculate stats from the drives data
        const activeDrives = drivesData.drives.filter((drive: VaccinationDrive) => drive.is_active).length;
        const totalDrives = drivesData.drives.length;
        
       
        const upcomingDrives = drivesData.drives.filter((drive: VaccinationDrive) => 
          new Date(drive.start_date) > new Date()
        ).length;
        
        setStats([
          {
            icon: <Users className="h-6 w-6 text-[#8ed500]" />,
            label: "Active Drives",
            value: activeDrives,
            description: `Out of ${totalDrives} total drives`,
          },
         
          {
            icon: <CalendarClock className="h-6 w-6 text-[#8ed500]" />,
            label: "Upcoming Drives",
            value: upcomingDrives,
            description: "Scheduled for the future",
          },
        ]);
      } catch (error) {
        console.error("Error fetching worker stats:", error);
        // Provide fallback data if API call fails
        setStats([
          {
            icon: <Users className="h-6 w-6 text-[#8ed500]" />,
            label: "Active Drives",
            value: "—",
            description: "Unable to load data",
          },
          {
            icon: <Syringe className="h-6 w-6 text-[#8ed500]" />,
            label: "Vaccinations Administered",
            value: "—",
            description: "Unable to load data",
          },
          {
            icon: <FileCheck className="h-6 w-6 text-[#8ed500]" />,
            label: "Pending Vaccinations",
            value: "—",
            description: "Unable to load data",
          },
          {
            icon: <CalendarClock className="h-6 w-6 text-[#8ed500]" />,
            label: "Upcoming Drives",
            value: "—",
            description: "Unable to load data",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
    if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="hover:scale-105 transition-transform duration-200">
            <Card className="bg-[#141414] border-0 shadow-xl">
              <CardHeader className="pb-2">
                <div className="h-6 w-24 bg-[#1c1c1c] rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-[#1c1c1c] rounded mb-2"></div>
                <div className="h-4 w-32 bg-[#1c1c1c] rounded"></div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >      {stats.map((stat, i) => (
        <motion.div
          key={i}
          variants={cardVariants}
          className="h-full hover:scale-105 transition-transform duration-200"
        >
          <Card className="bg-[#141414] border-0 shadow-xl h-full">            
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#222]">
              <CardTitle className="text-sm font-medium text-white">{stat.label}</CardTitle>
              <div>
                {stat.icon}
              </div>
            </CardHeader>            
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-white">
                {stat.value}
              </div>
              <p className="text-xs text-gray-400">{stat.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}