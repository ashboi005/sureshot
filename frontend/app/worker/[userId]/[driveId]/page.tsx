"use client"

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";

export default function WorkerQRRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const driveId = params.driveId as string;
  
  useEffect(() => {
    // Redirect to the worker dashboard with QR parameters
    if (userId && driveId) {
      router.push(`/worker?user_id=${userId}&drive_id=${driveId}`);
    } else {
      router.push('/worker');
    }
  }, [userId, driveId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-800">Processing Vaccination QR Code</h2>
        <p className="text-gray-600 max-w-md">
          Please wait while we prepare the vaccination form...
        </p>
      </div>
    </div>
  );
}
