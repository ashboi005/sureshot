"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { WorkerProfileCard } from '@/components/worker/worker-profile-card';
import { WorkerStatCards } from '@/components/worker/worker-stat-cards';
import { WorkerVaccinationDrives } from '@/components/worker/worker-vaccination-drives';
import { WorkerQRScanDialog } from '@/components/worker/worker-qr-scan-dialog';
import useUser from "@/hooks/useUser";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

const WorkerPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [qrScanOpen, setQrScanOpen] = useState(false);
  const [qrScannedData, setQrScannedData] = useState<{ userId?: string, driveId?: string }>({});
  
  // Check if we have QR data from URL parameters
  useEffect(() => {
    // Check for /worker/{userId}/{driveId} pattern in path
    const pathParts = pathname.split('/');
    if (pathParts.length >= 4 && pathParts[1] === 'worker') {
      const userId = pathParts[2];
      const driveId = pathParts[3];
      
      if (userId && driveId) {
        setQrScannedData({
          userId,
          driveId
        });
        setQrScanOpen(true);
      }
    }
    // Also check query params
    else {
      const userId = searchParams.get('user_id');
      const driveId = searchParams.get('drive_id');
      
      if (userId && driveId) {
        setQrScannedData({
          userId,
          driveId
        });
        setQrScanOpen(true);
      }
    }
  }, [pathname, searchParams]);
  
  // Handle successful QR scan completion
  const handleQRScanComplete = () => {
    // Clear scanned data and remove URL parameters
    setQrScannedData({});
    
    // Clear URL params if they exist
    if (searchParams.has('user_id') || searchParams.has('drive_id') ||
        pathname.split('/').length >= 4) {
      router.push('/worker');
    }
    
    // Refresh the current page to update data
    router.refresh();
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
        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white">Worker Dashboard</h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setQrScanOpen(true)}
            className="bg-[#8ed500] hover:bg-[#a5ec1c] text-[#141414] hover:text-[#141414] transition-all duration-300"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v1m6 11h2m-6 0h-2m0 0v7m0-7h-6m6 0l-4-4m0 0l4-4m-4 4h12" 
              />
            </svg>
            Scan QR Code
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <WorkerStatCards />
      </motion.div>
      
      <motion.div 
        variants={itemVariants} 
        className="grid gap-6"
      >
        <WorkerProfileCard />
        <WorkerVaccinationDrives />
      </motion.div>
      
      {/* QR Scan Dialog */}
      <WorkerQRScanDialog 
        open={qrScanOpen}
        onOpenChange={setQrScanOpen}
        onScanComplete={handleQRScanComplete}
        userId={qrScannedData.userId}
        driveId={qrScannedData.driveId}
      />
    </motion.div>
  )
}

export default WorkerPage