"use client"

import { Suspense } from 'react';
import { DoctorDashboardContent } from './DoctorDashboardContent';

export default function DoctorDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorDashboardContent />
    </Suspense>
  );
}
