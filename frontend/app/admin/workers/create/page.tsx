"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/display/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/forms/form"
import { FileUpload } from "../../components/ui/forms/file-upload"
import { ChevronLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm, FieldValues, ControllerRenderProps } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { api, CreateWorkerData } from "@/lib/api"
import { CitySelect } from "../../components/city-select"

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
  const [step, setStep] = useState<'form' | 'upload' | 'complete'>('form')
  const [workerData, setWorkerData] = useState<any>(null)

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

  const onSubmitForm = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      
      // Create worker first
      const worker = await api.createWorker(values)
      setCreatedWorkerId(worker.id)
      setWorkerData(worker)
      
      toast({
        title: "Worker information saved",
        description: `${worker.first_name} ${worker.last_name} has been created. Now upload their government ID.`,
      })
      
      setStep('upload')
      
    } catch (error) {
      console.error('Error creating worker:', error)
      toast({
        title: "Error",
        description: "Failed to create worker. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocumentUpload = async () => {
    if (!selectedFile || !createdWorkerId) return
    
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
      
      await api.uploadWorkerDocument(createdWorkerId, selectedFile)
      setUploadStatus('success')
      setUploadProgress(100)
      clearInterval(progressInterval)
      
      toast({
        title: "Document uploaded successfully",
        description: "Worker profile is now complete.",
      })
      
      setStep('complete')
      
      // Redirect after delay
      setTimeout(() => {
        router.push("/admin/workers")
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
      title: "Worker created",
      description: "Worker created without document. You can upload it later.",
    })
    router.push("/admin/workers")
  }

  const specializations = [
    "Community Health", "Vaccination Specialist", "Public Health", 
    "Primary Care", "Pediatric Care", "Maternal Health", "Infectious Diseases"
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/workers">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Healthcare Worker</h1>
          <p className="text-muted-foreground">
            {step === 'form' && 'Enter the healthcare worker details'}
            {step === 'upload' && 'Upload government ID document'}
            {step === 'complete' && 'Worker created successfully'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        {step === 'form' && (
          <Card>
            <CardHeader>
              <CardTitle>Worker Information</CardTitle>
              <CardDescription>
                Fill in all the required details to create a new healthcare worker.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <CitySelect
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select a city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter specialization" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experience_years"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience (Years)</FormLabel>
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
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Creating Worker..." : "Create Worker"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        )}

        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Government ID</CardTitle>
              <CardDescription>
                Upload the government ID document for {workerData?.first_name} {workerData?.last_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">              <FileUpload
                onFileSelect={setSelectedFile}
                onFileRemove={() => setSelectedFile(null)}
                accept="image/*,.pdf"
                maxSize={5 * 1024 * 1024} // 5MB
                uploadStatus={uploadStatus}
                uploadProgress={uploadProgress}
              />
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button 
                onClick={handleDocumentUpload} 
                disabled={!selectedFile || uploadStatus === 'uploading'}
                className="flex-1"
              >
                {uploadStatus === 'uploading' ? "Uploading..." : "Upload Document"}
              </Button>
              <Button 
                variant="outline" 
                onClick={skipUpload}
                disabled={uploadStatus === 'uploading'}
              >
                Skip for Now
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 'complete' && (
          <Card>            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Worker Created Successfully
              </CardTitle>
              <CardDescription>
                {workerData?.first_name} {workerData?.last_name} has been added to the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Redirecting to workers list...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
