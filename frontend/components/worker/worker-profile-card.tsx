"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { workerApi } from "@/services/worker";
import { WorkerProfile } from "@/types/WorkerTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Loader2, User, MapPin, Award, Calendar, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

export function WorkerProfileCard() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await workerApi.getWorkerProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching worker profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Card className="w-full bg-[#141414] border-0 shadow-xl">
          <CardContent className="flex justify-center items-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-[#8ed500]" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Card className="w-full bg-[#141414] border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Profile Not Found</CardTitle>
            <CardDescription className="text-gray-400">
              Your worker profile information could not be loaded.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }
  
  // Calculate initials for the avatar
  const getInitials = () => {
    if (!profile?.first_name && !profile?.last_name) return "WK";
    
    const firstInitial = profile.first_name ? profile.first_name[0] : '';
    const lastInitial = profile.last_name ? profile.last_name[0] : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full bg-[#141414] border-0 shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white">Worker Profile</CardTitle>
          <CardDescription className="text-gray-400">Your health worker information</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row gap-6"
          >
            <motion.div 
              variants={itemVariants}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Avatar className="h-24 w-24 border-2 border-[#8ed500]">
                  {profile.government_id_url ? (
                    <AvatarImage src={profile.government_id_url} alt="ID" />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-[#1c1c1c] text-[#8ed500]">{getInitials()}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex flex-col items-center text-center">
                <motion.h3 
                  className="text-xl font-semibold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : profile.username || "Health Worker"}
                </motion.h3>
                {profile.specialization && (
                  <motion.p 
                    className="text-[#8ed500]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {profile.specialization}
                  </motion.p>
                )}
                <motion.p 
                  className="text-sm text-gray-400 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {profile.email}
                </motion.p>
              </div>
            </motion.div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <MapPin className="h-5 w-5 text-[#8ed500] mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Location</p>
                    <p className="text-gray-400">{profile.city_name || "Not specified"}</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Calendar className="h-5 w-5 text-[#8ed500] mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Experience</p>
                    <p className="text-gray-400">
                      {profile.experience_years 
                        ? `${profile.experience_years} years` 
                        : "Not specified"}
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <BadgeCheck className="h-5 w-5 text-[#8ed500] mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Status</p>
                    <p className="text-gray-400">
                      {profile.is_active 
                        ? "Active" 
                        : "Inactive"}
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <User className="h-5 w-5 text-[#8ed500] mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Worker ID</p>
                    <p className="text-gray-400">{profile.id || "Not available"}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}