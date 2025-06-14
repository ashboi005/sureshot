"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";

interface PageProps {
  params: {
    userId: string;
    vaccineId: string;
  };
}

export default function DoctorQRRedirectPage({ params }: PageProps) {
  const router = useRouter();
  const { userId, vaccineId } = params;
    useEffect(() => {
    // Redirect to the doctor dashboard with QR parameters
    // This ensures the doctor's main page handles the vaccine administration
    if (userId && vaccineId) {
      // Check for dose parameter in the URL
      const searchParams = new URLSearchParams(window.location.search);
      const doseNumber = searchParams.get('dose');
      
      let redirectUrl = `/doctor?user_id=${userId}&vaccine_template_id=${vaccineId}`;
      
      // Add dose parameter if available
      if (doseNumber) {
        redirectUrl += `&dose=${doseNumber}`;
      }
      
      router.push(redirectUrl);
    } else {
      router.push('/doctor');
    }
  }, [userId, vaccineId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-800">Processing Vaccine QR Code</h2>
        <p className="text-gray-600 max-w-md">
          Please wait while we prepare the vaccine administration form...
        </p>
      </div>
    </div>
  );
}
