import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VaccineRecord } from "@/types/VaccineRecord";
import { getVaccinationHistory } from "@/lib/api/doctors";

interface VaccinationHistoryTableProps {
  userId: string;
}

export function VaccinationHistoryTable({ userId }: VaccinationHistoryTableProps) {
  const [history, setHistory] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const historyData = await getVaccinationHistory(userId);
        setHistory(historyData);
      } catch (error) {
        console.error(`Error fetching vaccination history for patient ${userId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-pulse">Loading vaccination history...</div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Vaccination Records</CardTitle>
          <CardDescription>
            This patient does not have any vaccination records yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vaccine</TableHead>
            <TableHead>Dose</TableHead>
            <TableHead>Date Administered</TableHead>
            <TableHead>Disease Prevented</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.vaccine_name}</TableCell>
              <TableCell>{record.dose_number}</TableCell>
              <TableCell>
                {typeof record.administered_date === 'string' 
                  ? new Date(record.administered_date).toLocaleDateString() 
                  : record.administered_date.toLocaleDateString()}
              </TableCell>
              <TableCell>{record.disease_prevented}</TableCell>
              <TableCell>{record.notes || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
