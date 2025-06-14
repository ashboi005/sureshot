"use client"
import React, { useState } from 'react'
import { User } from '@/types/User'
import useUser from '@/hooks/useUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Edit3, Mail, MapPin, Calendar, Phone, User as UserIcon, Droplets, Home, Baby } from 'lucide-react'
import axios from 'axios'

const profileUpdateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
 
  parent_name: z.string().min(2, 'Parent name must be at least 2 characters').max(100, 'Parent name must be less than 100 characters'),
  parent_mobile: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must be less than 15 digits'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Please select a gender' }),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], { required_error: 'Please select a blood group' }),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be less than 200 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(50, 'City must be less than 50 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State must be less than 50 characters'),
  pin_code: z.string().min(5, 'PIN code must be at least 5 digits').max(10, 'PIN code must be less than 10 digits'),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
})

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>

const ProfilePage = () => {
  const { user, loading, error } = useUser()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("User Data:", user)
  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: user?.username || '',
      parent_name: user?.parent_name || '',
      parent_mobile: user?.parent_mobile || '',
      gender: (user?.gender as 'Male' | 'Female' | 'Other') || 'Male',
      blood_group: (user?.blood_group as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-') || 'O+',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pin_code: user?.pin_code || '',
      avatar_url: user?.avatar_url || ''
    }
  })

  React.useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        parent_name: user.parent_name || '',
        parent_mobile: user.parent_mobile || '',
        gender: user.gender as 'Male' | 'Female' | 'Other' || 'Male',
        blood_group: user.blood_group as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' || 'O+',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pin_code: user.pin_code || '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user, form])

  const onSubmit = async (data: ProfileUpdateForm) => {
    console.log("Hello")
    try {
      setIsSubmitting(true);
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      toast.success('Profile updated successfully!');
      setIsEditDialogOpen(false);
      // Optionally refresh user data here
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {/* Main Profile Card */}
        <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <CardContent className="relative pt-0 pb-8">
            {/* Profile Picture */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar_url} alt={user.parent_name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {getInitials(user.parent_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">{user.parent_name}</h2>
              <p className="text-lg text-gray-600">@{user.username}</p>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{user.city}, {user.state}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center mb-8">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Personal Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <UserIcon className="w-5 h-5" />
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            name="parent_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="parent_mobile"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mobile Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter mobile number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="blood_group"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Blood Group</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select blood group" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                      </div>

                      <Separator />



                      {/* Address Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Home className="w-5 h-5" />
                          Address Information
                        </h3>
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your city" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your state" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pin_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PIN Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter PIN code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </div>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                   
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="">
          <Card className="shadow-lg border-0 mb-6 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserIcon className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{user.parent_mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Droplets className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Blood Group</p>
                    <Badge variant="secondary" className="mt-1">{user.blood_group}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Address Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Home className="w-5 h-5 text-green-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Address</p>
                  <p className="font-medium">{user.address}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">City</p>
                  <p className="font-medium">{user.city}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">State & PIN</p>
                  <p className="font-medium">{user.state} - {user.pin_code}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-500">
              <div>
                <p>Account created: {new Date(user.created_at).toLocaleDateString()}</p>
                <p>Last updated: {new Date(user.updated_at).toLocaleDateString()}</p>
              </div>
              <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                Active Account
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage