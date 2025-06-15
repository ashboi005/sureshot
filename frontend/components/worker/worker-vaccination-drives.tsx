"use client";

import { useState, useEffect } from "react";
import { workerApi } from "@/services/worker";
import { WorkerDrivesResponse } from "@/types/WorkerTypes";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Loader2, Calendar, MapPin, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export function WorkerVaccinationDrives() {
  const [drives, setDrives] = useState<WorkerDrivesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  const fetchDrives = async () => {
    try {
      const data = await workerApi.getMyVaccinationDrives(!showAll);
      setDrives(data);
    } catch (error) {
      console.error("Error fetching vaccination drives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [showAll]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!drives || drives.drives.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Vaccination Drives</CardTitle>
          <CardDescription>
            You have not been assigned to any vaccination drives yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Vaccination Drives</h2>
        <Button variant="outline" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show Active Only" : "Show All Drives"}
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drives.drives.map((drive) => (
          <Card key={drive.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl">{drive.vaccination_name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {drive.vaccination_city}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(drive.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                    {" - "}
                    {new Date(drive.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Status: {drive.is_active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-gray-500">Inactive</span>
                    )}
                  </span>
                </div>
                {drive.description && (
                  <p className="text-muted-foreground mt-2 line-clamp-2">
                    {drive.description}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => router.push(`/worker/drive/${drive.id}`)}
                className="w-full"
                variant="default"
              >
                View Participants
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
