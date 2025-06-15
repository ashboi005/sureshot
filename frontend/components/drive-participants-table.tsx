"use client"

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { jsPDF } from 'jspdf';
import { Clock, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Download as IconFilePdf } from 'lucide-react';
import { motion } from 'framer-motion';
import { workerApi } from "@/services/worker";

interface BabyInfo {
  id: string;
  baby_name: string;
  parent_name: string;
  parent_mobile: string;
  address: string;
  is_vaccinated: boolean;
  vaccination_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  worker_id: string | null;
}

interface DriveParticipantsTableProps {
  driveId: string;
}

export function DriveParticipantsTable({ driveId }: DriveParticipantsTableProps) {
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [babyInfo, setBabyInfo] = useState<BabyInfo[]>([]);
  const [currentDateTime] = useState(new Date().toLocaleString());
  
  useEffect(() => {
    const fetchDriveParticipants = async () => {
      try {
        setLoading(true);
        if (driveId) {
          const participants = await workerApi.getDriveParticipants(driveId);
          setBabyInfo(participants.participants || []);
        }
      } catch (error) {
        console.error("Error fetching drive participants:", error);
        toast.error("Failed to load vaccination drive data");
      } finally {
        setLoading(false);
      }
    };

    fetchDriveParticipants();
  }, [driveId]);

  const downloadPDF = () => {
    if (!babyInfo || babyInfo.length === 0) {
      toast.error("No vaccination data to download");
      return;
    }
    
    setPdfGenerating(true);
    
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(0, 128, 0);
      pdf.text("SureShot - Vaccination Drive Report", 20, 20);
      
      // Add logo placeholder
      pdf.setDrawColor(0, 128, 0);
      pdf.setFillColor(0, 128, 0);
      pdf.circle(175, 15, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text("V", 173, 19);
      
      // Add metadata
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${currentDateTime}`, 20, 30);
      pdf.text(`Drive ID: ${driveId}`, 20, 35);
      
      // Add summary
      pdf.setFontSize(12);
      pdf.setTextColor(0, 100, 0);
      
      const vaccinated = babyInfo.filter(b => b.is_vaccinated).length;
      const pending = babyInfo.filter(b => !b.is_vaccinated).length;
      
      pdf.text(`Total Participants: ${babyInfo.length}`, 20, 45);
      pdf.text(`Vaccinated: ${vaccinated} | Pending: ${pending}`, 20, 52);
      
      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 58, 190, 58);
      
      // Add table headers
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Baby Name", 20, 65);
      pdf.text("Parent", 60, 65);
      pdf.text("Contact", 100, 65);
      pdf.text("Address", 130, 65);
      pdf.text("Status", 170, 65);
      
      // Add table content
      let y = 75;
      babyInfo.forEach((baby, index) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text("Baby Name", 20, y);
          pdf.text("Parent", 60, y);
          pdf.text("Contact", 100, y);
          pdf.text("Address", 130, y);
          pdf.text("Status", 170, y);
          y += 10;
        }
        
        // Set row background based on status
        if (baby.is_vaccinated) {
          pdf.setFillColor(240, 255, 240);
        } else {
          pdf.setFillColor(255, 240, 240);
        }
        pdf.rect(15, y - 5, 180, 10, 'F');
        
        // Write data
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        pdf.text(baby.baby_name, 20, y);
        pdf.text(baby.parent_name, 60, y);
        pdf.text(baby.parent_mobile, 100, y);
        
        // Truncate address if too long
        const address = baby.address.length > 20 ? 
                        `${baby.address.substring(0, 20)}...` : 
                        baby.address;
        pdf.text(address, 130, y);
        
        // Status text with color
        pdf.setTextColor(baby.is_vaccinated ? 0 : 200, baby.is_vaccinated ? 128 : 0, 0);
        pdf.text(baby.is_vaccinated ? "Vaccinated" : "Pending", 170, y);
        
        // Add vaccination date if applicable
        if (baby.is_vaccinated && baby.vaccination_date) {
          y += 8;
          pdf.setFontSize(9);
          pdf.setTextColor(0, 100, 0);
          pdf.text(`✓ Vaccinated on: ${new Date(baby.vaccination_date).toLocaleDateString()}`, 25, y);
        }
        
        y += 15;
      });
      
      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`SureShot - Page ${i} of ${pageCount}`, pdf.internal.pageSize.width / 2, 290, { align: 'center' });
      }
      
      pdf.save(`Vaccination_Drive_${driveId}_${currentDateTime.replace(/[: ]/g, '_')}.pdf`);
      toast.success("Vaccination drive report downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfGenerating(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.1,
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible" 
        className="flex flex-col items-center justify-center py-10 text-gray-400"
      >
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-2">Loading vaccination drive data...</p>
      </motion.div>
    );
  }

  if (!babyInfo || babyInfo.length === 0) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible" 
        className="flex flex-col items-center justify-center py-10 text-gray-400"
      >
        <p>No participants found for this vaccination drive.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <motion.div variants={contentVariants}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Vaccination Drive Participants</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadPDF}
              disabled={pdfGenerating}
              className="ml-2 text-gray-300 hover:text-[#8ed500] hover:bg-[#8ed500]/10"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <IconFilePdf className="h-4 w-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#8ed500]/60 mr-1"></div>
              <span className="text-xs text-gray-400">Vaccinated: {babyInfo.filter(b => b.is_vaccinated).length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500/60 mr-1"></div>
              <span className="text-xs text-gray-400">Pending: {babyInfo.filter(b => !b.is_vaccinated).length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[#333] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1c1c1c]">
              <TableRow className="border-b border-[#333]">
                <TableHead className="text-[#8ed500] font-medium">Baby Name</TableHead>
                <TableHead className="text-[#8ed500] font-medium">Parent</TableHead>
                <TableHead className="text-[#8ed500] font-medium">Contact</TableHead>
                <TableHead className="text-[#8ed500] font-medium">Address</TableHead>
                <TableHead className="text-[#8ed500] font-medium">Status</TableHead>
                <TableHead className="text-[#8ed500] font-medium text-right">Vaccination Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {babyInfo.map((baby) => (
                <TableRow key={baby.id} className="border-b border-[#333] hover:bg-[#1c1c1c]">
                  <TableCell className="font-medium text-white">{baby.baby_name}</TableCell>
                  <TableCell className="text-gray-300">{baby.parent_name}</TableCell>
                  <TableCell className="text-gray-300">{baby.parent_mobile}</TableCell>
                  <TableCell className="text-gray-300">{baby.address}</TableCell>
                  <TableCell>
                    {baby.is_vaccinated ? (
                      <Badge className="bg-[#8ed500]/20 text-[#8ed500] border border-[#8ed500]/30 hover:bg-[#8ed500]/20">
                        Vaccinated
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-gray-300">
                    {baby.is_vaccinated && baby.vaccination_date ? (
                      new Date(baby.vaccination_date).toLocaleDateString()
                    ) : (
                      <span className="text-gray-500">Not vaccinated</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </motion.div>
  );
}