"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "../../components/ui/core"
import { Input } from "../../components/ui/core"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/forms"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/display"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FileUpload } from "../../components/ui/forms"
import { ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { api, CreateWorkerRequest } from "@/lib/api"

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  city_name: z.string().min(1, "City is required"),
  specialization: z.string().min(1, "Specialization is required"),
  experience_years: z.number().min(0, "Experience must be 0 or more").max(50, "Experience cannot exceed 50 years"),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateWorkerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [createdWorkerId, setCreatedWorkerId] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      city_name: "",
      specialization: "",
      experience_years: 0,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      
      // Create worker
      const worker = await api.createWorker(values)
      setCreatedWorkerId(worker.id)
      
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
          await api.uploadWorkerDocument(worker.id, selectedFile)
          setUploadStatus('success')
          setUploadProgress(100)
        } catch (error) {
          setUploadStatus('error')
          console.error('Document upload failed:', error)
        }
        
        clearInterval(progressInterval)
      }

      toast({
        title: "Worker created successfully",
        description: `${worker.first_name} ${worker.last_name} has been added to the system.`,
      })

      // Redirect to workers list after a brief delay
      setTimeout(() => {
        router.push("/admin/workers")
      }, 1500)
      
    } catch (error) {
      console.error('Failed to create worker:', error)
      toast({
        title: "Error",
        description: "Failed to create worker. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", 
    "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur"
  ]

  const specializations = [
    "Community Health", "Vaccination Specialist", "Public Health", 
    "Primary Care", "Pediatric Care", "Maternal Health", "Infectious Diseases"
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/workers">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Workers
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Healthcare Worker</h1>
          <p className="text-muted-foreground">Add a new healthcare worker to the system</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Worker Information</CardTitle>
            <CardDescription>
              Enter the healthcare worker's details and upload their government ID document.
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
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
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                {/* Document Upload */}
                <div className="space-y-2">
                  <FileUpload
                    label="Government ID Document"
                    description="Upload worker's government ID (PDF, JPG, PNG - max 5MB)"
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
                  {isSubmitting ? "Creating Worker..." : "Create Worker"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}
