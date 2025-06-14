"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/forms/form"
import { FileUpload } from "../../components/ui/forms/file-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/forms/select-black"
import { ChevronLeft, CheckCircle, Stethoscope, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { api, CreateDoctorData } from "@/lib/api"

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
  const [createdDoctorId, setCreatedDoctorId] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'upload' | 'complete'>('form')
  const [doctorData, setDoctorData] = useState<any>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),    defaultValues: {
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

  const onSubmitForm = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      
      // Create doctor first
      const doctor = await api.createDoctor(values)
      setCreatedDoctorId(doctor.id)
      setDoctorData(doctor)
      
      toast({
        title: "Doctor information saved",
        description: `Dr. ${doctor.first_name} ${doctor.last_name} has been created. Now upload their medical council registration.`,
      })
      
      setStep('upload')
      
    } catch (error) {
      console.error('Error creating doctor:', error)
      toast({
        title: "Error",
        description: "Failed to create doctor. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocumentUpload = async () => {
    if (!selectedFile || !createdDoctorId) return
    
    try {
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
      
      await api.uploadDoctorDocument(createdDoctorId, selectedFile)
      setUploadStatus('success')
      setUploadProgress(100)
      clearInterval(progressInterval)
      
      toast({
        title: "Document uploaded successfully",
        description: "Doctor profile is now complete.",
      })
      
      setStep('complete')
      
      // Redirect after delay
      setTimeout(() => {
        router.push("/admin/doctors")
      }, 2000)
      
    } catch (error) {
      setUploadStatus('error')
      console.error('Document upload failed:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload document. You can try again later.",
        variant: "destructive"
      })
    }
  }

  const skipUpload = () => {
    toast({
      title: "Doctor created",
      description: "Doctor created without document. You can upload it later.",
    })
    router.push("/admin/doctors")
  }
  const specializations = [
    "General Medicine", "Pediatrics", "Cardiology", "Neurology", "Oncology",
    "Orthopedics", "Dermatology", "Psychiatry", "Radiology", "Pathology",
    "Anesthesiology", "Emergency Medicine", "Family Medicine", "Internal Medicine"
  ]

  if (step === 'complete') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/doctors">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Doctors
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Doctor Created Successfully!</h2>
              <p className="text-muted-foreground">
                Dr. {doctorData?.first_name} {doctorData?.last_name} has been added to the system.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to doctors list...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setStep('form')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Form
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Medical Council Registration</h1>
          <p className="text-muted-foreground">
            Upload Dr. {doctorData?.first_name} {doctorData?.last_name}'s medical council registration document
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="mr-2 h-5 w-5" />
              Medical Council Registration
            </CardTitle>
            <CardDescription>
              Upload a clear copy of the medical council registration certificate (PDF or image format)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">            <FileUpload
              onFileSelect={setSelectedFile}
              onFileRemove={() => setSelectedFile(null)}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5}
              uploadStatus={uploadStatus}
              uploadProgress={uploadProgress}
            />
            
            {selectedFile && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={skipUpload}>
              Skip for Now
            </Button>
            <Button 
              onClick={handleDocumentUpload} 
              disabled={!selectedFile || uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Document'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/doctors">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Doctors
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Doctor</h1>
        <p className="text-muted-foreground">
          Enter the doctor's professional information and credentials
        </p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="mr-2 h-5 w-5" />
            Doctor Information
          </CardTitle>
          <CardDescription>
            Please provide accurate information for the doctor's profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          Unique username for login
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
                          Minimum 8 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
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
                    name="experience_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter years of experience"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
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
                          <Input placeholder="Enter hospital name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>                    )}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Creating Doctor..." : "Create Doctor"}
                </Button>
                <Link href="/admin/doctors">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>      </Card>
    </div>
  )
}