"use client";

import { useState, useEffect } from "react";
import { workerApi } from "@/services/worker";
import { WorkerProfile } from "@/types/WorkerTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Loader2, User, MapPin, Award, Calendar, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function WorkerProfileCard() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await workerApi.getWorkerProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching worker profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>
            Your worker profile information could not be loaded.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  // Calculate initials for the avatar
  const getInitials = () => {
    if (!profile?.first_name && !profile?.last_name) return "WK";
    
    const firstInitial = profile.first_name ? profile.first_name[0] : '';
    const lastInitial = profile.last_name ? profile.last_name[0] : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Worker Profile</CardTitle>
        <CardDescription>Your health worker information</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            {profile.government_id_url ? (
              <AvatarImage src={profile.government_id_url} alt="ID" />
            ) : null}
            <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold">
              {profile.first_name && profile.last_name 
                ? `${profile.first_name} ${profile.last_name}` 
                : profile.username || "Health Worker"}
            </h3>
            {profile.specialization && (
              <p className="text-muted-foreground">{profile.specialization}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">{profile.city_name || "Not specified"}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Experience</p>
                <p className="text-muted-foreground">
                  {profile.experience_years 
                    ? `${profile.experience_years} years` 
                    : "Not specified"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <BadgeCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Status</p>
                <p className="text-muted-foreground">
                  {profile.is_active 
                    ? "Active" 
                    : "Inactive"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Worker ID</p>
                <p className="text-muted-foreground">{profile.id || "Not available"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
