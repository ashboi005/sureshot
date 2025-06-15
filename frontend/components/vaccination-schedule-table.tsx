import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VaccinationSchedule } from "@/types/VaccinationSchedule";

interface VaccinationScheduleTableProps {
  schedules: VaccinationSchedule[];
  onMarkAdministered: (scheduleId: string) => void;
}

export function VaccinationScheduleTable({ schedules, onMarkAdministered }: VaccinationScheduleTableProps) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <p>No vaccination schedules found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vaccine</TableHead>
            <TableHead>Dose</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Disease Prevented</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.vaccine_name}</TableCell>
              <TableCell>{schedule.dose_number}</TableCell>
              <TableCell>{new Date(schedule.due_date).toLocaleDateString()}</TableCell>
              <TableCell>
                {schedule.is_administered ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Administered
                  </Badge>
                ) : schedule.is_overdue ? (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    Overdue
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell>{schedule.disease_prevented}</TableCell>
              <TableCell className="text-right">
                {!schedule.is_administered && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAdministered(schedule.id)}
                  >
                    Mark Administered
                  </Button>
                )}
                {schedule.is_administered && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    Completed on {schedule.administered_date ? new Date(schedule.administered_date).toLocaleDateString() : 'N/A'}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
