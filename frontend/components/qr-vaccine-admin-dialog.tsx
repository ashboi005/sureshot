import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import useUser from "@/hooks/useUser";
import { useAtom } from "jotai";
import { doctorIdAtom } from "@/lib/atoms";
import { getDoctorIdByUserId } from "@/lib/api/doctors/doctorId";
import { administeredVaccineByQR } from "@/lib/api/doctors";

interface QRVaccineAdminProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId?: string;
  vaccineTemplateId?: string;
  doseNumber?: string;
}

const QRVaccineAdminDialog: React.FC<QRVaccineAdminProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  userId, 
  vaccineTemplateId,
  doseNumber
}) => {  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [doctorId, setDoctorId] = useAtom(doctorIdAtom);
  const { user } = useUser();
    // Fetch doctor ID if not already available
  useEffect(() => {
    const fetchDoctorIdIfNeeded = async () => {
      // If we already have the doctor ID in the Jotai atom, use it
      if (doctorId) return;
      
      // If not found and we have a user ID, try to fetch it
      if (user?.user_id) {
        try {
          const response = await getDoctorIdByUserId(user.user_id);
          if (response.doctor_id) {
            setDoctorId(response.doctor_id);
          }
        } catch (error) {
          console.error("Failed to fetch doctor ID:", error);
          // Non-blocking - we'll use user_id as fallback
        }
      }
    };
    
    fetchDoctorIdIfNeeded();
  }, [user, doctorId, setDoctorId]);
  const handleSubmit = async () => {
    if (!userId || !vaccineTemplateId) {
      toast.error("Missing patient or vaccine information");
      return;
    }
      // Only check the doctor ID from the Jotai atom
    
    // If we don't have a doctor ID from the atom, check if user exists
    if (!doctorId && (!user || !user.user_id)) {
      toast.error("Doctor information not available");
      return;
    }    
    setLoading(true);
    setCurrentStep(1); // Move to loading animation
    
    try {
      // Artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the API function from lib/api/doctors.ts
      await administeredVaccineByQR(
        userId,
        vaccineTemplateId,
        doctorId || user!.user_id, // Use doctor_id from Jotai atom or fallback to user_id
        doseNumber ? parseInt(doseNumber, 10) : 1, // Use provided dose or default to 1
        notes || ""
      );
      
      setCurrentStep(2); // Move to success animation
      
      // After showing success animation
      setTimeout(() => {
        toast.success("Vaccine successfully administered!");
        setNotes("");
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error administering vaccine:", error);
      toast.error("Failed to administer vaccine. Please try again.");
      setCurrentStep(0); // Go back to form
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input 
                id="patient-id" 
                value={userId || ''} 
                readOnly 
                className="bg-muted"
              />
            </div>
              <div className="space-y-2">
              <Label htmlFor="vaccine-id">Vaccine ID</Label>
              <Input 
                id="vaccine-id" 
                value={vaccineTemplateId || ''} 
                readOnly 
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dose-number">Dose Number</Label>
              <Input 
                id="dose-number" 
                value={doseNumber || '1'} 
                readOnly 
                className="bg-muted"
              />
            </div>
              <div className="space-y-2">
              <Label htmlFor="doctor-id">Doctor ID</Label>
              <Input 
                id="doctor-id" 
                value={doctorId || user?.user_id || 'Not available'} 
                readOnly 
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="administered-date">Administered Date</Label>
              <Input 
                id="administered-date" 
                value={new Date().toISOString().split('T')[0]} 
                readOnly 
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any notes about this vaccination"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Administer Vaccine
              </Button>
            </div>
          </div>
        );
      
      case 1: // Loading Animation
        return (
          <div className="py-8 flex flex-col items-center justify-center">
            <motion.div 
              className="relative w-32 h-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-0 border-8 border-indigo-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-12 h-12 text-indigo-600" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </motion.div>
            <motion.h3
              className="mt-6 text-xl font-semibold text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Administering Vaccine
            </motion.h3>
            <motion.p
              className="text-gray-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Processing your request...
            </motion.p>
          </div>
        );
      
      case 2: // Success Animation
        return (
          <div className="py-8 flex flex-col items-center justify-center">
            <motion.div 
              className="bg-green-100 rounded-full p-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <svg 
                className="w-16 h-16 text-green-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <motion.h3
              className="mt-6 text-xl font-semibold text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Vaccine Administered Successfully!
            </motion.h3>
            <motion.p
              className="text-gray-500 mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              The patient's vaccination record has been updated.
            </motion.p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => {
      if (!isOpen) {
        // Reset state when dialog is closed
        setCurrentStep(0);
        setLoading(false);
        setNotes("");
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentStep === 0 ? "Administer Vaccine" : 
             currentStep === 1 ? "Processing" : "Success"}
          </DialogTitle>
        </DialogHeader>
        
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default QRVaccineAdminDialog;
