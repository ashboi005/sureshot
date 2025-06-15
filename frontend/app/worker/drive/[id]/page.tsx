"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  Loader2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Syringe
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { workerApi } from "@/services/worker";
import { VaccinationDrive } from "@/types/VaccinationDrives";
import { Badge } from "@/components/ui/badge";
import { DriveParticipantsTable } from "@/components/drive-participants-table";
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      stiffness: 100,
      damping: 12
    }
  }
};

export default function DrivePage() {
  const router = useRouter();
  const params = useParams();
  const driveId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!driveId) {
    return <div>Invalid drive ID.</div>;
  }

  return (
    <DriveParticipantsTable driveId={driveId} />
  );
}