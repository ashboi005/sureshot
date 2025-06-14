"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "../../components/ui/core"
import { Input } from "../../components/ui/core"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/forms"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/display"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FileUpload } from "../../components/ui/forms"
import { ChevronLeft, Stethoscope } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { api, CreateDoctorRequest } from "@/lib/api"

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  specialization: z.string().min(1, "Specialization is required"),
  hospital_affiliation: z.string().min(1, "Hospital affiliation is required"),
  experience_years: z.number().min(0, "Experience must be 0 or more").max(50, "Experience cannot exceed 50 years"),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateDoctorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      specialization: "",
      hospital_affiliation: "",
      experience_years: 0,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      
      // Create doctor
      const doctor = await api.createDoctor(values)
      
      // Upload document if file is selected
      if (selectedFile) {
        setUploadStatus('uploading')
        setUploadProgress(0)
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)
        
        try {
          await api.uploadDoctorDocument(doctor.id, selectedFile)
          setUploadStatus('success')
          setUploadProgress(100)
        } catch (error) {
          setUploadStatus('error')
          console.error('Document upload failed:', error)
        }
        
        clearInterval(progressInterval)
      }

      toast({
        title: "Doctor created successfully",
        description: `Dr. ${doctor.first_name} ${doctor.last_name} has been added to the system.`,
      })

      // Redirect to doctors list after a brief delay
      setTimeout(() => {
        router.push("/admin/doctors")
      }, 1500)
      
    } catch (error) {
      console.error('Failed to create doctor:', error)
      toast({
        title: "Error",
        description: "Failed to create doctor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const specializations = [
    "General Medicine", "Pediatrics", "Cardiology", "Neurology", "Orthopedics",
    "Dermatology", "Psychiatry", "Radiology", "Anesthesiology", "Emergency Medicine",
    "Family Medicine", "Internal Medicine", "Surgery", "Obstetrics & Gynecology"
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/doctors">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Doctors
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Doctor</h1>
          <p className="text-muted-foreground">Add a new doctor to the system</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Information
            </CardTitle>
            <CardDescription>
              Enter the doctor's details and upload their medical council registration certificate.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be used for login purposes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Minimum 8 characters required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Professional Information */}
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Specialization</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hospital_affiliation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital Affiliation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hospital or clinic name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Current primary hospital or clinic affiliation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Medical Experience</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Document Upload */}
                <div className="space-y-2">
                  <FileUpload
                    label="Medical Council Registration Certificate"
                    description="Upload doctor's medical council registration certificate (PDF, JPG, PNG - max 5MB)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5}
                    onFileSelect={setSelectedFile}
                    onFileRemove={() => setSelectedFile(null)}
                    selectedFile={selectedFile}
                    uploadProgress={uploadProgress}
                    uploadStatus={uploadStatus}
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creating Doctor..." : "Create Doctor"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}
