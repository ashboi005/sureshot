"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, Search, MapPin, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { workerApi } from "@/services/worker";
import { VaccinationDrive } from "@/types/VaccinationDrives";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      
      stiffness: 100,
      damping: 12,
    },
  },
};

const cardHoverVariants = {
  hover: {
    y: -5,
    boxShadow: "0px 10px 20px rgba(142, 213, 0, 0.15)",
    transition: {
      stiffness: 400,
      damping: 10
    }
  }
};

export default function WorkerDrivesPage() {
  const [drives, setDrives] = useState<VaccinationDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "past">("all");
  const [totalDrives, setTotalDrives] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(10);
  const [currentDateTime] = useState("2025-06-15 12:42:13");

  // Fetch vaccination drives
  const fetchDrives = async (page = 0, activeFilter = false) => {
    setLoading(true);
    try {
      const skip = page * limit;
      const activeOnly = filterStatus === "active" ? true : false;
      const data = await workerApi.getMyVaccinationDrives(activeOnly, limit, skip);
      setDrives(data.drives);
      setTotalDrives(data.total || data.drives.length);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching vaccination drives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives(0, filterStatus === "active");
  }, [filterStatus]);

  // Filter drives based on search term
  const filteredDrives = drives.filter((drive) => {
    const searchTermMatch = drive.vaccination_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.vaccination_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return searchTermMatch;
    if (filterStatus === "active") return drive.is_active && searchTermMatch;
    if (filterStatus === "past") return !drive.is_active && searchTermMatch;
    
    return searchTermMatch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Calculate status based on dates
  const getDriveStatus = (drive: VaccinationDrive) => {
    const now = new Date(currentDateTime);
    const startDate = new Date(drive.start_date);
    const endDate = new Date(drive.end_date);

    if (!drive.is_active) return "Inactive";
    if (now < startDate) return "Upcoming";
    if (now > endDate) return "Completed";
    return "Active";
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#8ed500]/20 text-[#8ed500] border-[#8ed500]/30";
      case "Upcoming":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Completed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "Inactive":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  // Calculate days remaining or days until start
  const getDaysInfo = (drive: VaccinationDrive) => {
    const now = new Date(currentDateTime);
    const startDate = new Date(drive.start_date);
    const endDate = new Date(drive.end_date);
    
    if (now < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`;
    }
    
    if (now <= endDate) {
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
    }
    
    const daysPassed = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    return `Ended ${daysPassed} day${daysPassed !== 1 ? 's' : ''} ago`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Vaccination Drives</h2>
          <p className="text-gray-400 mt-1">Manage and view your assigned vaccination drives</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#8ed500]" />
            <Input
              placeholder="Search drives..."
              className="pl-8 bg-[#1c1c1c] border-[#333] text-white w-full transition-all duration-200 hover:border-[#8ed500]/50 focus:border-[#8ed500]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <SelectTrigger className="w-full sm:w-36 bg-[#1c1c1c] border-[#333] text-white transition-all duration-200 hover:border-[#8ed500]/50">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#8ed500]" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1c1c1c] border-[#333] text-white">
              <SelectItem value="all">All Drives</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="past">Past Drives</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="bg-[#141414] border-[#333]">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-2/3 mb-2 bg-[#1c1c1c]" />
                  <Skeleton className="h-4 w-1/3 bg-[#1c1c1c]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-[#1c1c1c]" />
                  <Skeleton className="h-4 w-5/6 mb-2 bg-[#1c1c1c]" />
                  <Skeleton className="h-4 w-4/6 bg-[#1c1c1c]" />
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Skeleton className="h-10 bg-[#1c1c1c]" />
                    <Skeleton className="h-10 bg-[#1c1c1c]" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : filteredDrives.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="bg-[#141414] border-[#333] text-center p-8">
            <CardContent>
              <div className="flex flex-col items-center py-8">
                <Calendar className="h-16 w-16 text-[#8ed500]/40 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Vaccination Drives Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchTerm 
                    ? "No drives match your search criteria." 
                    : filterStatus === "active" 
                      ? "No active drives found." 
                      : filterStatus === "past" 
                        ? "No past drives found." 
                        : "You don't have any assigned vaccination drives."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive, index) => {
            const status = getDriveStatus(drive);
            const statusStyles = getStatusStyles(status);
            const daysInfo = getDaysInfo(drive);
            
            return (
              <motion.div 
                key={drive.id} 
                variants={itemVariants}
                custom={index}
                whileHover="hover"
              >
                <motion.div
                  variants={cardHoverVariants}
                  className="h-full"
                >
                  <Card className="bg-[#141414] border-[#333] shadow-xl h-full flex flex-col">
                    <CardHeader className="pb-2 border-b border-[#333] relative">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-white text-xl">{drive.vaccination_name}</CardTitle>
                        <Badge className={`${statusStyles} border`}>
                          {status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center space-x-2 text-gray-400">
                        <MapPin className="h-3.5 w-3.5 text-[#8ed500]" />
                        <span>{drive.vaccination_city}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 flex-grow">
                      <div>
                        <p className="text-gray-300 text-sm line-clamp-2">{drive.description || "No description provided."}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-3.5 w-3.5 text-[#8ed500]" />
                        <span>{daysInfo}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <Label className="text-xs text-[#8ed500]">Start Date</Label>
                          <p className="text-white text-sm">{formatDate(drive.start_date)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-[#8ed500]">End Date</Label>
                          <p className="text-white text-sm">{formatDate(drive.end_date)}</p>
                        </div>
                      </div>
                    </CardContent>
                    
                    <div className="p-4 pt-1 mt-auto border-t border-[#333] flex">
                      <Link href={`/worker/drive/${drive.id}`} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-[#8ed500]/30 hover:bg-[#8ed500]/10 text-[#8ed500] hover:text-white transition duration-200 flex items-center justify-center gap-2 group"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {totalDrives > limit && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4"
        >
          <div className="text-sm text-gray-400 order-2 sm:order-1">
            Showing {currentPage * limit + 1}-{Math.min((currentPage + 1) * limit, totalDrives)} of {totalDrives} drives
          </div>
          <div className="space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => fetchDrives(currentPage - 1)}
              className="border-[#333] hover:bg-[#333] text-gray-300 hover:text-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(currentPage + 1) * limit >= totalDrives}
              onClick={() => fetchDrives(currentPage + 1)}
              className="border-[#333] hover:bg-[#333] text-gray-300 hover:text-white"
            >
              Next
            </Button>
          </div>
        </motion.div>
      )}
      
    
    </motion.div>
  );
}