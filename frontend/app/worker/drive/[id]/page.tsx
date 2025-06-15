"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  Loader2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Syringe
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { workerApi } from "@/services/worker";
import { VaccinationDrive } from "@/types/VaccinationDrives";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

export default function DrivePage() {
  const router = useRouter();
  const params = useParams();
  const driveId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [drive, setDrive] = useState<VaccinationDrive | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState("2025-06-15 12:40:07");
  
  useEffect(() => {
    (async () => {
      try {
        const response = await workerApi.getMyVaccinationDrives(false);
        const foundDrive = response.drives.find((drive: VaccinationDrive) => drive.id === driveId);
        
        if (foundDrive) {
          setDrive(foundDrive);
        }
      } catch (error) {
        console.error("Error fetching drive details:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [driveId]);

  // Calculate days remaining or days passed
  const calculateDaysInfo = () => {
    if (!drive) return { text: "N/A", isPast: false };
    
    const currentDate = new Date(currentDateTime);
    const startDate = new Date(drive.start_date);
    const endDate = new Date(drive.end_date);
    
    // Drive hasn't started yet
    if (currentDate < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        text: `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`,
        isPast: false,
        isUpcoming: true
      };
    }
    
    // Drive is ongoing
    if (currentDate >= startDate && currentDate <= endDate) {
      const daysRemaining = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        text: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`,
        isPast: false,
        isActive: true
      };
    }
    
    // Drive is completed
    const daysPassed = Math.ceil((currentDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    return { 
      text: `Ended ${daysPassed} day${daysPassed !== 1 ? 's' : ''} ago`,
      isPast: true,
      isCompleted: true
    };
  };

  const daysInfo = drive ? calculateDaysInfo() : { text: "N/A", isPast: false };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8ed500]" />
      </div>
    );
  }
  
  // Calculate drive duration in days
  const driveDuration = drive ? 
    Math.ceil((new Date(drive.end_date).getTime() - new Date(drive.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 
    0;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto py-6 space-y-6"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center space-x-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/worker')}
          className="flex items-center gap-1 text-white hover:bg-[#333] hover:text-[#8ed500]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </motion.div>
      
      {drive && (
        <>
          <motion.div variants={itemVariants}>
            <Card className="mb-6 bg-[#141414] border-0 shadow-xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl text-white mb-2">
                      {drive.vaccination_name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-[#8ed500] mr-2" />
                          <span>{drive.vaccination_city}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-[#8ed500] mr-2" />
                          <span>
                            {new Date(drive.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                            {" to "}
                            {new Date(drive.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <Badge 
                      className={
                        daysInfo.isUpcoming ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                        daysInfo.isActive ? "bg-[#8ed500]/20 text-[#8ed500] border border-[#8ed500]/30" :
                        "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                      }
                    >
                      {daysInfo.isUpcoming ? "Upcoming" : daysInfo.isActive ? "Active" : "Completed"}
                    </Badge>
                    <span className="text-sm text-gray-400">{daysInfo.text}</span>
                  </div>
                </div>
              </CardHeader>
              {drive.description && (
                <CardContent className="border-t border-[#333] pt-4">
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-[#8ed500] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">{drive.description}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-4">
              Drive Overview
            </h2>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            <Card className="bg-[#141414] border-0 shadow-xl hover:shadow-[#8ed500]/5 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#8ed500]" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {driveDuration} Days
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(drive.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {new Date(drive.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#141414] border-0 shadow-xl hover:shadow-[#8ed500]/5 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <Syringe className="h-5 w-5 text-[#8ed500]" />
                  Vaccine Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {drive.vaccination_name}
                </div>
                <p className="text-xs text-gray-400">COVID-19 Vaccination</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#141414] border-0 shadow-xl hover:shadow-[#8ed500]/5 transition-all duration-300 md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#8ed500]" />
                  Workers Assigned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {drive.assigned_workers.length || 0}
                </div>
                <p className="text-xs text-gray-400">Health workers on duty</p>
              </CardContent>
            </Card>
          </motion.div>
          
      =
          
          <motion.div variants={itemVariants} className="mt-4">
            <Card className="bg-[#141414] border-0 shadow-xl hover:shadow-[#8ed500]/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Created By</h3>
                    <p className="text-white">ID: {drive.created_by}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Created At</h3>
                    <p className="text-white">{new Date(drive.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Last Updated</h3>
                    <p className="text-white">{new Date(drive.updated_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Drive ID</h3>
                    <p className="text-white truncate">{drive.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex justify-end pt-4 gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/worker/drives')}
              className="border-[#333] text-gray-300 hover:bg-[#333] hover:text-white"
            >
              View All Drives
            </Button>
            <Button
              onClick={() => router.push(`/worker`)}
              className="bg-[#8ed500] text-[#141414] hover:bg-white transition-all duration-300"
            >
              Back to Dashboard
            </Button>
          </motion.div>
        </>
      )}
      
      {!drive && (
        <motion.div variants={itemVariants}>
          <Card className="bg-[#141414] border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Drive Not Found</CardTitle>
              <CardDescription className="text-gray-400">
                The vaccination drive you're looking for couldn't be found.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/worker')}
                className="bg-[#8ed500] text-[#141414] hover:bg-white transition-all duration-300"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}