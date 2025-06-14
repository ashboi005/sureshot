import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/Patient";

interface PatientListTableProps {
  patients: Patient[];
  onViewDetails: (patientId: string) => void;
}

export function PatientListTable({ patients, onViewDetails }: PatientListTableProps) {
  if (!patients || patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <p>No patients found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Baby Name</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Parent Name</TableHead>
            <TableHead>Parent Contact</TableHead>
            <TableHead>First Visit</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.user_id}>
              <TableCell className="font-medium">{patient.baby_name}</TableCell>
              <TableCell>{new Date(patient.baby_date_of_birth).toLocaleDateString()}</TableCell>
              <TableCell>{patient.parent_name}</TableCell>
              <TableCell>{patient.parent_mobile}</TableCell>
              <TableCell>{new Date(patient.first_interaction_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(patient.user_id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
