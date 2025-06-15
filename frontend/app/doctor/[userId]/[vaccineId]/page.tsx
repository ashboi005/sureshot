"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { useParams, useSearchParams } from 'next/navigation';

export default function DoctorQRRedirectPage() {
  const router = useRouter();
  const params = useParams<{ userId: string; vaccineId: string }>();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    try {
      const doseNumber = searchParams.get('dose');
      
      if (params.userId && params.vaccineId) {
        const redirectUrl = `/doctor?user_id=${params.userId}&vaccine_template_id=${params.vaccineId}${doseNumber ? `&dose=${doseNumber}` : ''}`;
        router.push(redirectUrl);
      } else {
        router.push('/doctor');
      }
    } catch (error) {
      console.error('Redirect failed:', error);
      router.push('/doctor?error=redirect_failed');
    }
  }, [params.userId, params.vaccineId, router, searchParams]);

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