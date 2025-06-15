"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState, useEffect } from "react";
import { workerApi } from "@/services/worker";
import { Loader2, Users, Syringe, FileCheck, CalendarClock } from "lucide-react";
import { VaccinationDrive } from "@/types/VaccinationDrives";

interface WorkerStat {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
}

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
        
        // For demonstration, we're using placeholder values for statistics that would
        // require additional API calls in a real implementation
        const placeholderVaccinated = Math.floor(Math.random() * 100) + 50; // Placeholder
        const upcomingDrives = drivesData.drives.filter((drive: VaccinationDrive) => 
          new Date(drive.start_date) > new Date()
        ).length;
        
        setStats([
          {
            icon: <Users className="h-6 w-6 text-blue-500" />,
            label: "Active Drives",
            value: activeDrives,
            description: `Out of ${totalDrives} total drives`,
          },
          {
            icon: <Syringe className="h-6 w-6 text-green-500" />,
            label: "Vaccinations Administered",
            value: placeholderVaccinated,
            description: "Total vaccinations given",
          },
          {
            icon: <FileCheck className="h-6 w-6 text-purple-500" />,
            label: "Pending Vaccinations",
            value: Math.floor(Math.random() * 50) + 10, // Placeholder
            description: "Requires your attention",
          },
          {
            icon: <CalendarClock className="h-6 w-6 text-amber-500" />,
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
            icon: <Users className="h-6 w-6 text-blue-500" />,
            label: "Active Drives",
            value: "—",
            description: "Unable to load data",
          },
          {
            icon: <Syringe className="h-6 w-6 text-green-500" />,
            label: "Vaccinations Administered",
            value: "—",
            description: "Unable to load data",
          },
          {
            icon: <FileCheck className="h-6 w-6 text-purple-500" />,
            label: "Pending Vaccinations",
            value: "—",
            description: "Unable to load data",
          },
          {
            icon: <CalendarClock className="h-6 w-6 text-amber-500" />,
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
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-24 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
