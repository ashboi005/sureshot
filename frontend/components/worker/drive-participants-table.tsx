"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { workerApi } from "@/services/worker";
import { DriveParticipantsResponse, DriveParticipant } from "@/types/WorkerTypes";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"; // Removed Table import from lucide-react
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { DialogHeader, DialogFooter } from "../ui/dialog";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../ui/form";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const formSchema = z.object({
  notes: z.string().optional(),
});

interface DriveParticipantsTableProps {
  driveId: string;
}

export function DriveParticipantsTable({ driveId }: DriveParticipantsTableProps) {
  const [participants, setParticipants] = useState<DriveParticipantsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaccinatingParticipant, setVaccinatingParticipant] = useState<DriveParticipant | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });

  const fetchParticipants = async () => {
    try {
      const data = await workerApi.getDriveParticipants(driveId);
      setParticipants(data);
    } catch (error) {
      console.error("Error fetching drive participants:", error);
      toast.error("Failed to fetch drive participants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [driveId]);

  const handleVaccinate = async (participant: DriveParticipant) => {
    setVaccinatingParticipant(participant);
  };

  const onSubmitVaccinate = async (values: z.infer<typeof formSchema>) => {
    if (!vaccinatingParticipant) return;

    try {
      await workerApi.administerDriveVaccine(driveId, {
        user_id: vaccinatingParticipant.user_id,
        vaccination_date: new Date().toISOString(),
        notes: values.notes,
      });

      toast.success("Vaccination record updated successfully");
      fetchParticipants();
      setVaccinatingParticipant(null);
    } catch (error) {
      console.error("Error administering vaccine:", error);
      toast.error("Failed to update vaccination record");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!participants || participants.participants.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold">No participants found</h3>
        <p className="text-muted-foreground">
          There are no participants registered for this vaccination drive yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{participants.drive_name}</CardTitle>
          <CardDescription>
            Location: {participants.drive_city} • {participants.total} Participants
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Baby Name</TableHead>
              <TableHead>Parent Details</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">
                  {participant.baby_name || "N/A"}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{participant.parent_name || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{participant.parent_mobile || "N/A"}</div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {participant.address || "N/A"}
                </TableCell>
                <TableCell>
                  {participant.is_vaccinated ? (
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span>
                        Vaccinated 
                        {participant.vaccination_date && (
                          <span className="block text-xs text-muted-foreground">
                            {new Date(participant.vaccination_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                      <span>Pending</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {!participant.is_vaccinated ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => handleVaccinate(participant)}
                        >
                          Vaccinate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Administer Vaccine</DialogTitle>
                          <DialogDescription>
                            Confirm vaccination for {participant.baby_name || "this participant"}.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmitVaccinate)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Add any notes about the vaccination"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Add any important information or observations.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Confirm Vaccination</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Badge variant="outline">Completed</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
