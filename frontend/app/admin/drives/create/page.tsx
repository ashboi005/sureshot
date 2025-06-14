"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "../../components/ui/core/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/forms/form"
import { Calendar } from "../../components/ui/forms/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/overlays"
import { CitySelect } from "../../components/city-select"
import { CalendarIcon, ChevronLeft, Loader2, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "../../components/ui/forms/checkbox"
import { Badge } from "../../components/ui/core/badge"
import { api, WorkerResponse } from "@/lib/api"
import Link from "next/link"

const formSchema = z.object({
  vaccination_name: z.string().min(5, {
    message: "Drive name must be at least 5 characters.",
  }),
  vaccination_city: z.string().min(2, {
    message: "City name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  start_date: z.date({
    required_error: "Start date is required.",
  }),
  end_date: z.date({
    required_error: "End date is required.",
  }),
  assigned_worker_ids: z.array(z.string()).min(1, {
    message: "Please assign at least one healthcare worker.",
  }),
})

export default function CreateVaccinationDrivePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [workers, setWorkers] = useState<WorkerResponse[]>([])
  const [loadingWorkers, setLoadingWorkers] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vaccination_name: "",
      vaccination_city: "",
      description: "",
      assigned_worker_ids: [],
    },
  })

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true)
      const response = await api.getWorkers(0, 100) // Get all workers
      setWorkers(response.workers.filter(worker => worker.is_active))
    } catch (error) {
      console.error('Error fetching workers:', error)
      toast({
        title: "Error",
        description: "Failed to fetch workers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingWorkers(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true)
      
      // Validate that end date is after start date
      if (values.end_date <= values.start_date) {
        form.setError("end_date", {
          type: "manual",
          message: "End date must be after start date",
        })
        return
      }

      const driveData = {
        ...values,
        start_date: values.start_date.toISOString().split('T')[0],
        end_date: values.end_date.toISOString().split('T')[0],
      }

      await api.createVaccinationDrive(driveData)

      toast({
        title: "Success!",
        description: "Vaccination drive created successfully.",
      })

      router.push("/admin/drives")
    } catch (error) {
      console.error('Error creating drive:', error)
      toast({
        title: "Error",
        description: "Failed to create vaccination drive. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleWorkerToggle = (workerId: string) => {
    const currentWorkers = form.getValues("assigned_worker_ids")
    const isSelected = currentWorkers.includes(workerId)
    
    if (isSelected) {
      const updatedWorkers = currentWorkers.filter(id => id !== workerId)
      form.setValue("assigned_worker_ids", updatedWorkers)
    } else {
      const updatedWorkers = [...currentWorkers, workerId]
      form.setValue("assigned_worker_ids", updatedWorkers)
    }
  }

  const selectedWorkerIds = form.watch("assigned_worker_ids")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/drives">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Drives
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Vaccination Drive</h1>
        <p className="text-muted-foreground">
          Set up a new vaccination drive and assign healthcare workers
        </p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Drive Information</CardTitle>
          <CardDescription>
            Provide the basic details for this vaccination drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vaccination_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drive Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Polio Vaccination Drive - North District" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />                <FormField
                  control={form.control}
                  name="vaccination_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <CitySelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select city"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the vaccination drive, including target population, goals, and any special instructions..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Assign Healthcare Workers</Label>
                    <p className="text-sm text-muted-foreground">
                      Select workers who will be responsible for this vaccination drive
                    </p>
                  </div>
                  <Badge variant="secondary">
                    <Users className="mr-1 h-3 w-3" />
                    {selectedWorkerIds.length} selected
                  </Badge>
                </div>

                {loadingWorkers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading workers...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {workers.map((worker) => (
                      <div
                        key={worker.id}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedWorkerIds.includes(worker.id)
                            ? "bg-primary/10 border-primary"
                            : "bg-background hover:bg-muted"
                        )}
                        onClick={() => handleWorkerToggle(worker.id)}
                      >
                        <Checkbox
                          checked={selectedWorkerIds.includes(worker.id)}
                          onChange={() => {}} // Handled by the parent div click
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {worker.first_name} {worker.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {worker.specialization} • {worker.city_name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {form.formState.errors.assigned_worker_ids && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.assigned_worker_ids.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? "Creating Drive..." : "Create Vaccination Drive"}
                </Button>
                <Link href="/admin/drives">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
