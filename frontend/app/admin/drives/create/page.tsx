"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "../../components/ui/core/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/forms/form"
import { DatePicker } from "../../components/ui/forms/date-picker-clean"
import { CitySelect } from "../../components/city-select"
import { ChevronLeft, Loader2, Users } from "lucide-react"
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
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerResponse[]>([])
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

  const selectedCity = form.watch("vaccination_city")

  useEffect(() => {
    fetchWorkers()
  }, [])

  useEffect(() => {
    // Filter workers by selected city
    if (selectedCity) {
      const filtered = workers.filter(worker => 
        worker.city_name && worker.city_name.toLowerCase().includes(selectedCity.toLowerCase())
      )
      setFilteredWorkers(filtered)
    } else {
      setFilteredWorkers(workers)
    }
    // Reset selected workers when city changes
    form.setValue("assigned_worker_ids", [])
  }, [selectedCity, workers, form])

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
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
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
  const handleWorkerToggle = useCallback((workerId: string) => {
    const currentWorkers = form.getValues("assigned_worker_ids")
    const isSelected = currentWorkers.includes(workerId)
    
    if (isSelected) {
      const updatedWorkers = currentWorkers.filter(id => id !== workerId)
      form.setValue("assigned_worker_ids", updatedWorkers)
    } else {
      const updatedWorkers = [...currentWorkers, workerId]
      form.setValue("assigned_worker_ids", updatedWorkers)
    }
  }, [form])

  const selectedWorkerIds = form.watch("assigned_worker_ids")

  return (
    <div className="space-y-6">      <div className="flex items-center space-x-4">
        <Link href="/admin/drives">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Drives
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Vaccination Drive</h1>
        <p className="text-gray-600">
          Set up a new vaccination drive and assign healthcare workers
        </p>
      </div><Card className="max-w-4xl bg-white border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-gray-900">Drive Information</CardTitle>
          <CardDescription className="text-gray-600">
            Provide the basic details for this vaccination drive
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                <FormField
                  control={form.control}
                  name="vaccination_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">Drive Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Polio Vaccination Drive - North District" 
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vaccination_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">City</FormLabel>
                      <FormControl>
                        <CitySelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select city"
                        />
                      </FormControl>                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the vaccination drive, including target population, goals, and any special instructions..."
                        className="min-h-[100px] bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-gray-900">Start Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onDateChange={field.onChange}
                          placeholder="Select start date"
                          minDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-gray-900">End Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onDateChange={field.onChange}
                          placeholder="Select end date"
                          minDate={form.getValues("start_date") || new Date()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium text-gray-900">Assign Healthcare Workers</Label>
                    <p className="text-sm text-gray-600">
                      Select workers who will be responsible for this vaccination drive
                      {selectedCity && ` in ${selectedCity}`}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    <Users className="mr-1 h-3 w-3" />
                    {selectedWorkerIds.length} selected
                  </Badge>
                </div>

                {!selectedCity && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Please select a city first to see available workers for that location.
                    </p>
                  </div>
                )}

                {loadingWorkers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                    <span className="ml-2 text-gray-600">Loading workers...</span>
                  </div>
                ) : filteredWorkers.length === 0 && selectedCity ? (
                  <div className="text-center py-8 text-gray-500">
                    No workers found in {selectedCity}. You may need to add workers for this city first.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                    {filteredWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedWorkerIds.includes(worker.id)
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white hover:bg-gray-50 border-gray-200"                        )}
                      >
                        <Checkbox
                          checked={selectedWorkerIds.includes(worker.id)}
                          onCheckedChange={() => handleWorkerToggle(worker.id)}
                          className={selectedWorkerIds.includes(worker.id) ? "text-white" : ""}
                        />
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleWorkerToggle(worker.id)}
                        >
                          <p className={cn(
                            "text-sm font-medium truncate",
                            selectedWorkerIds.includes(worker.id) ? "text-white" : "text-gray-900"
                          )}>
                            {worker.first_name} {worker.last_name}
                          </p>
                          <p className={cn(
                            "text-xs truncate",
                            selectedWorkerIds.includes(worker.id) ? "text-gray-200" : "text-gray-500"
                          )}>
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
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? "Creating Drive..." : "Create Vaccination Drive"}
                </Button>
                <Link href="/admin/drives">
                  <Button 
                    variant="outline" 
                    type="button"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
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
