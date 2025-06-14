import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient } from "@/types/Patient";

interface PatientDetailsCardProps {
  patient: Patient;
}

export function PatientDetailsCard({ patient }: PatientDetailsCardProps) {
  if (!patient) {
    return null;
  }

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    
    const months = (today.getMonth() - birthDate.getMonth() + 12) % 12;
    
    if (years === 0) {
      return `${months} months`;
    } else if (years < 2) {
      return `${years} year, ${months} months`;
    } else {
      return `${years} years, ${months} months`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient.baby_name}</CardTitle>
        <CardDescription>
          Age: {calculateAge(patient.baby_date_of_birth)} | Gender: {patient.gender} | Blood Group: {patient.blood_group}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Parent Information</h4>
            <p className="mt-1">{patient.parent_name}</p>
            <p className="text-sm text-muted-foreground">{patient.parent_mobile}</p>
            <p className="text-sm text-muted-foreground">{patient.parent_email}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
            <p className="mt-1">{patient.address}</p>
            <p className="text-sm text-muted-foreground">
              {patient.city}, {patient.state} - {patient.pin_code}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
