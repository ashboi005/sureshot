"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { workerApi } from "@/services/worker";
import { WorkerDrivesResponse } from "@/types/WorkerTypes";
import { Button } from "../ui/button";
import { Loader2, Calendar, MapPin, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

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
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(142, 213, 0, 0.2)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  }
};

export function WorkerVaccinationDrives() {
  const [drives, setDrives] = useState<WorkerDrivesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  const fetchDrives = async () => {
    try {
      const data = await workerApi.getMyVaccinationDrives(!showAll);
      setDrives(data);
    } catch (error) {
      console.error("Error fetching vaccination drives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [showAll]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center p-8"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#8ed500]" />
      </motion.div>
    );
  }

  if (!drives || drives.drives.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <Card className="bg-[#141414] border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">No Vaccination Drives</CardTitle>
            <CardDescription className="text-gray-400">
              You have not been assigned to any vaccination drives yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Your Vaccination Drives</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
            className="border-[#8ed500] text-[#8ed500] hover:bg-[#8ed500]/10 hover:text-white transition duration-300"
          >
            {showAll ? "Show Active Only" : "Show All Drives"}
          </Button>
        </motion.div>
      </div>
      
      <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drives.drives.map((drive, index) => (
          <motion.div
            key={drive.id}
            variants={cardVariants}
            whileHover="hover"
            custom={index}
            transition={{ 
              type: "spring" as const, 
              stiffness: 400, 
              damping: 17,
              delay: index * 0.05 
            }}
          >
            <Card className="overflow-hidden bg-[#141414] border-0 shadow-xl h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl text-white">{drive.vaccination_name}</CardTitle>
                  {drive.is_active ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-[#8ed500]/20 text-[#8ed500]">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-700/20 text-gray-400">Inactive</span>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-3.5 w-3.5 text-[#8ed500]" />
                  {drive.vaccination_city}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[#8ed500]" />
                    <span>
                      {new Date(drive.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                      {" - "}
                      {new Date(drive.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#8ed500]" />
                    <span>
                      Status: {drive.is_active ? (
                        <span className="text-[#8ed500] font-medium">Active</span>
                      ) : (
                        <span className="text-gray-400">Inactive</span>
                      )}
                    </span>
                  </div>
                  {drive.description && (
                    <motion.p 
                      className="text-gray-400 mt-2 line-clamp-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {drive.description}
                    </motion.p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <motion.div 
                  className="w-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button 
                    onClick={() => router.push(`/worker/drive/${drive.id}`)}
                    className="w-full bg-[#8ed500] text-[#141414] hover:bg-white hover:text-[#141414] transition-all duration-300"
                  >
                    View Participants
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}