"use client"

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VaccinationSchedule } from "@/types/VaccinationSchedule";
import { jsPDF } from 'jspdf';
import { Clock, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Download as IconFilePdf } from 'lucide-react';
import { motion } from 'framer-motion';

// Current date and user login
const CURRENT_DATE_TIME = "2025-06-15 15:53:25";
const CURRENT_USER = "HarnoorSingh1234";

interface VaccinationScheduleTableProps {
  schedules: VaccinationSchedule[];
  onMarkAdministered: (scheduleId: string) => void;
}

export function VaccinationScheduleTable({ schedules, onMarkAdministered }: VaccinationScheduleTableProps) {
  const [pdfGenerating, setPdfGenerating] = useState(false);
  
  const downloadPDF = () => {
    if (!schedules || schedules.length === 0) {
      toast.error("No vaccination schedules to download");
      return;
    }
    
    setPdfGenerating(true);
    
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(0, 128, 0); // Green color for title
      pdf.text("SureShot - Vaccination Schedule", 20, 20);
      
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
      pdf.text(`Generated on: ${CURRENT_DATE_TIME}`, 20, 30);
      pdf.text(`User: ${CURRENT_USER}`, 20, 35);
      
      // Add schedule count summary
      pdf.setFontSize(12);
      pdf.setTextColor(0, 100, 0);
      
      const administered = schedules.filter(s => s.is_administered).length;
      const pending = schedules.filter(s => !s.is_administered && !s.is_overdue).length;
      const overdue = schedules.filter(s => s.is_overdue).length;
      
      pdf.text(`Total Schedules: ${schedules.length}`, 20, 45);
      pdf.text(`Administered: ${administered} | Pending: ${pending} | Overdue: ${overdue}`, 20, 52);
      
      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 58, 190, 58);
      
      // Add table headers
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Vaccine", 20, 65);
      pdf.text("Dose", 75, 65);
      pdf.text("Due Date", 100, 65);
      pdf.text("Status", 140, 65);
      pdf.text("Disease", 170, 65);
      
      // Add table content
      let y = 75;
      schedules.forEach((schedule, index) => {
        // Add a new page if we're running out of space
        if (y > 270) {
          pdf.addPage();
          y = 20;
          
          // Add table headers on new page
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text("Vaccine", 20, y);
          pdf.text("Dose", 75, y);
          pdf.text("Due Date", 100, y);
          pdf.text("Status", 140, y);
          pdf.text("Disease", 170, y);
          y += 10;
        }
        
        // Set row background based on status
        if (schedule.is_administered) {
          pdf.setFillColor(240, 255, 240); // Light green for administered
        } else if (schedule.is_overdue) {
          pdf.setFillColor(255, 240, 240); // Light red for overdue
        } else {
          pdf.setFillColor(255, 250, 220); // Light yellow for pending
        }
        pdf.rect(15, y - 5, 180, 10, 'F');
        
        // Write data
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        pdf.text(schedule.vaccine_name, 20, y);
        pdf.text(`Dose ${schedule.dose_number}`, 75, y);
        pdf.text(new Date(schedule.due_date).toLocaleDateString(), 100, y);
        
        // Status text with color
        const status = schedule.is_administered ? "Administered" : 
                      schedule.is_overdue ? "Overdue" : "Pending";
        
        pdf.setTextColor(
          schedule.is_administered ? 0 : schedule.is_overdue ? 200 : 150,
          schedule.is_administered ? 128 : schedule.is_overdue ? 0 : 120,
          schedule.is_overdue ? 0 : 0
        );
        pdf.text(status, 140, y);
        
        // Disease prevented
        pdf.setTextColor(0, 0, 0);
        const diseaseName = schedule.disease_prevented.length > 15 ? 
                          `${schedule.disease_prevented.substring(0, 15)}...` : 
                          schedule.disease_prevented;
        pdf.text(diseaseName, 170, y);
        
        // Add administered date if applicable
        if (schedule.is_administered && schedule.administered_date) {
          y += 8;
          pdf.setFontSize(9);
          pdf.setTextColor(0, 100, 0);
          pdf.text(`✓ Administered on: ${new Date(schedule.administered_date).toLocaleDateString()}`, 25, y);
        }
        
        y += 15; // Move to next row with spacing
      });
      
      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`SureShot - Page ${i} of ${pageCount}`, pdf.internal.pageSize.width / 2, 290, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(`Vaccination_Schedule_${CURRENT_DATE_TIME.replace(/[: ]/g, '_')}.pdf`);
      
      toast.success("Vaccination schedule PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfGenerating(false);
    }
  };
  
  // Animation variants
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

  if (!schedules || schedules.length === 0) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible" 
        className="flex flex-col items-center justify-center py-10 text-gray-400"
      >
        <p>No vaccination schedules found.</p>
        
       
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
            <h2 className="text-lg font-semibold text-white">Vaccination Schedule</h2>
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
                  Download PDF
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#8ed500]/60 mr-1"></div>
              <span className="text-xs text-gray-400">Administered: {schedules.filter(s => s.is_administered).length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500/60 mr-1"></div>
              <span className="text-xs text-gray-400">Pending: {schedules.filter(s => !s.is_administered && !s.is_overdue).length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500/60 mr-1"></div>
              <span className="text-xs text-gray-400">Overdue: {schedules.filter(s => s.is_overdue).length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[#333] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1c1c1c]">
              <TableRow className="border-b border-[#333]">
                <TableHead className="text-[#8ed500] font-medium">Vaccine</TableHead>
                <TableHead className="text-[#8ed500] font-medium">Dose</TableHead>
                <TableHead className="text-[#8ed500] font-medium">Due Date</TableHead>
                <TableHead className="text-[#8ed500] font-medium">Status</TableHead>
                <TableHead className="text-[#8ed500] font-medium">Disease Prevented</TableHead>
                <TableHead className="text-[#8ed500] font-medium text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id} className="border-b border-[#333] hover:bg-[#1c1c1c]">
                  <TableCell className="font-medium text-white">{schedule.vaccine_name}</TableCell>
                  <TableCell className="text-gray-300">Dose {schedule.dose_number}</TableCell>
                  <TableCell className="text-gray-300">{new Date(schedule.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {schedule.is_administered ? (
                      <Badge className="bg-[#8ed500]/20 text-[#8ed500] border border-[#8ed500]/30 hover:bg-[#8ed500]/20">
                        Administered
                      </Badge>
                    ) : schedule.is_overdue ? (
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                        Overdue
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/20">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">{schedule.disease_prevented}</TableCell>
                  <TableCell className="text-right">
                    {!schedule.is_administered && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#333] hover:bg-[#8ed500]/10 hover:text-[#8ed500] hover:border-[#8ed500]/30"
                        onClick={() => onMarkAdministered(schedule.id)}
                      >
                        Mark Administered
                      </Button>
                    )}
                    {schedule.is_administered && (
                      <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Completed on {schedule.administered_date ? new Date(schedule.administered_date).toLocaleDateString() : 'N/A'}
                      </Badge>
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