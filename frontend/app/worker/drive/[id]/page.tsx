"use client";

import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { workerApi } from "@/services/worker";
import { VaccinationDrive } from "@/types/VaccinationDrives";
import { DriveParticipantsTable } from "@/components/worker/drive-participants-table";

export default function DrivePage() {
  const router = useRouter();
  const params = useParams();
  const driveId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [drive, setDrive] = useState<VaccinationDrive | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Using an async function with useEffect for data fetching
  useEffect(() => {
    // Create a self-invoking async function
    (async () => {
      try {
        // This is a workaround since there's no direct API to get a single drive
        // In a real implementation, you'd likely have an API endpoint to get a single drive
        const response = await workerApi.getMyVaccinationDrives(false);
        const foundDrive = response.drives.find((drive: VaccinationDrive) => drive.id === driveId);
        
        if (foundDrive) {
          setDrive(foundDrive);
        }
      } catch (error) {
        console.error("Error fetching drive details:", error);
      } finally {
        setLoading(false);
      }
    })(); // Self-invoke the async function
  }, [driveId]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/worker')}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      {drive && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{drive.vaccination_name}</CardTitle>
            <CardDescription>
              <div className="space-y-1">
                <div>Location: {drive.vaccination_city}</div>
                <div>
                  Duration: {new Date(drive.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                  {" - "}
                  {new Date(drive.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="mt-1">
                  Status: {drive.is_active ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          {drive.description && (
            <CardContent>
              <p className="text-muted-foreground">{drive.description}</p>
            </CardContent>
          )}
        </Card>
      )}
      
      <h1 className="text-3xl font-bold tracking-tight">Vaccination Drive Participants</h1>
      <p className="text-muted-foreground">
        View and manage participants for this vaccination drive.
      </p>
      
      <DriveParticipantsTable driveId={driveId as string} />
    </div>
  );
}
