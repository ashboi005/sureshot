"use client"

import React, { useState, useRef } from 'react'
import { User } from '@/types/User'
import useUser from '@/hooks/useUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, Trash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Edit3, Mail, MapPin, Calendar, Phone, User as UserIcon, Droplets, Home, Baby, Heart, Clock } from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

// Current date and user info
const CURRENT_DATE_TIME = "2025-06-15 15:12:09";
const CURRENT_USER = "HarnoorSingh1234";

const profileUpdateSchema = z.object({
  // Parent Information
  parent_name: z.string().min(2, 'Parent name must be at least 2 characters').max(100, 'Parent name must be less than 100 characters'),
  parent_mobile: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must be less than 15 digits'),
  parent_email: z.string().email('Please enter a valid email address'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be less than 200 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(50, 'City must be less than 50 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State must be less than 50 characters'),
  pin_code: z.string().min(5, 'PIN code must be at least 5 digits').max(10, 'PIN code must be less than 10 digits'),
  
  // Baby Information
  baby_name: z.string().min(2, 'Baby name must be at least 2 characters').max(50, 'Baby name must be less than 50 characters'),
  baby_date_of_birth: z.string().min(1, 'Please select baby\'s date of birth'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Please select gender' }),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], { required_error: 'Please select a blood group' }),
  avatar_url: z.string().optional().or(z.literal(''))
})

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      duration: 0.3 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      stiffness: 100,
      damping: 12
    }
  }
};

const ProfilePage = () => {
  const { user, loading, error } = useUser()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      parent_name: user?.parent_name || '',
      parent_mobile: user?.parent_mobile || '',
      parent_email: user?.parent_email || user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pin_code: user?.pin_code || '',
      baby_name: user?.baby_name || '',
      baby_date_of_birth: user?.baby_date_of_birth || '',
      gender: (user?.gender as 'Male' | 'Female' | 'Other') || 'Other',
      blood_group: (user?.blood_group as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-') || 'O+',
      avatar_url: user?.avatar_url || '',
    }
  })

  React.useEffect(() => {
    if (user) {
      form.reset({
        parent_name: user.parent_name || '',
        parent_mobile: user.parent_mobile || '',
        parent_email: user.parent_email || user.email || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pin_code: user.pin_code || '',
        baby_name: user.baby_name || '',
        baby_date_of_birth: user.baby_date_of_birth || '',
        gender: user.gender as 'Male' | 'Female' | 'Other' || 'Other',
        blood_group: user.blood_group as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' || 'O+',
        avatar_url: user.avatar_url || '',
      })
    }
  }, [user, form])
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    // Validate file size
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
      return;
    }
    
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Update user data with new avatar URL
      if (response.data.avatar_url) {
        form.setValue('avatar_url', response.data.avatar_url);
        toast.success('Profile image updated successfully!');
        
        // Force a refresh to show the new image
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle image deletion
  const handleDeleteImage = async () => {
    if (!user?.avatar_url) return;
    
    if (!confirm('Are you sure you want to delete your profile image?')) {
      return;
    }
    
    try {
      setIsDeletingImage(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/profile-image`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      form.setValue('avatar_url', '');
      toast.success('Profile image deleted successfully!');
      
      // Force a refresh to update the UI
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete image. Please try again.');
    } finally {
      setIsDeletingImage(false);
    }
  };
  
  const onSubmit = async (data: ProfileUpdateForm) => {
    try {
      setIsSubmitting(true);

      const result = await form.trigger();
      if (!result) {
        toast.error('Please fix the form errors before submitting');
        return;
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      toast.success('Profile updated successfully!');
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#8ed500] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <Card className="w-full max-w-md bg-[#141414] border-[#333] text-white shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Profile</h3>
            <p className="text-gray-400">{error.message}</p>
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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A'
    const birth = new Date(birthDate)
    const today = new Date()
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} old`
    } else {
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`
      } else {
        return `${years}y ${remainingMonths}m old`
      }
    }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#0c0c0c] py-8 px-4"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8ed500] to-[#a0ff00] bg-clip-text text-transparent">
            Child Profile
          </h1>
          <p className="text-gray-400">Manage your child's information</p>
        </motion.div>

        {/* Hero Card with Baby Info */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden shadow-xl border-[#333] bg-[#141414]">
            <div className="h-32 bg-gradient-to-r from-[#8ed500]/80 via-[#8ed500] to-[#a0ff00]"></div>
            <CardContent className="relative pt-0 pb-8">              <div className="flex justify-center -mt-16 mb-6">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-[#141414] shadow-lg">
                    <AvatarImage src={user.avatar_url} alt={user.baby_name} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[#8ed500] to-[#a0ff00] text-[#141414]">
                      {getInitials(user.baby_name || 'Baby')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Hidden file input */}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  
                  {/* Upload/Delete controls - appear on hover */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-2 bg-[#0c0c0c]/80 px-2 py-1 rounded-full backdrop-blur-sm">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white hover:bg-[#8ed500]/20 hover:text-[#8ed500]"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {user.avatar_url && (
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-red-500/20 hover:text-red-500"
                          onClick={handleDeleteImage}
                          disabled={isDeletingImage}
                        >
                          {isDeletingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-white">{user.baby_name || 'Little One'}</h2>
                <p className="text-lg text-gray-300">{calculateAge(user.baby_date_of_birth)}</p>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Heart className="w-4 h-4 text-[#8ed500]" />
                  <span>Loved by {user.parent_name}</span>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#8ed500] hover:bg-[#a0ff00] text-[#141414] px-8 font-medium transition-colors">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-[#141414] border-[#333] text-white">
                    <DialogHeader>
                      <DialogTitle className="text-white">Edit Family Profile</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Parent Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-[#333] pb-2">
                            <UserIcon className="w-5 h-5 text-[#8ed500]" />
                            Parent Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="parent_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Parent Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter parent name" 
                                      {...field} 
                                      className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="parent_mobile"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Mobile Number</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter mobile number" 
                                      {...field} 
                                      className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="parent_email"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel className="text-gray-300">Email Address</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder="Enter email address" 
                                      {...field} 
                                      className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Separator className="bg-[#333]" />

                        {/* Baby Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-[#333] pb-2">
                            <Baby className="w-5 h-5 text-[#8ed500]" />
                            Baby Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="baby_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Baby Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter baby name" 
                                      {...field} 
                                      className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="baby_date_of_birth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Date of Birth</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      {...field} 
                                      className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Gender</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-[#1c1c1c] border-[#333] text-white focus:ring-[#8ed500]">
                                        <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#1c1c1c] border-[#333] text-white">
                                      <SelectItem value="Male">Male</SelectItem>
                                      <SelectItem value="Female">Female</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="blood_group"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Blood Group</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-[#1c1c1c] border-[#333] text-white focus:ring-[#8ed500]">
                                        <SelectValue placeholder="Select blood group" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#1c1c1c] border-[#333] text-white">
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
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />                            <FormField
                              control={form.control}
                              name="avatar_url"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel className="text-gray-300">Profile Photo</FormLabel>
                                  <div className="text-gray-400 text-sm">
                                    <p>You can upload a profile photo by clicking on the upload icon near the profile picture at the top of the profile page.</p>
                                    <input type="hidden" {...field} />
                                  </div>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Separator className="bg-[#333]" />

                        {/* Address Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-[#333] pb-2">
                            <Home className="w-5 h-5 text-[#8ed500]" />
                            Address Information
                          </h3>
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">Address</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your address" 
                                    {...field} 
                                    className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">City</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your city" 
                                      {...field} 
                                      className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">State</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your state" 
                                      {...field} 
                                      className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="pin_code"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">PIN Code</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter PIN code" 
                                      {...field} 
                                      className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            className="flex-1 bg-[#8ed500] hover:bg-[#a0ff00] text-[#141414] font-medium"
                            disabled={isSubmitting}
                          >
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
        </motion.div>

        {/* Information Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Baby Information Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-xl border-[#333] bg-[#141414]">
              <CardHeader className="border-b border-[#333]">
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Baby className="w-5 h-5 text-[#8ed500]" />
                  Baby Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#1c1c1c] rounded-lg">
                    <Baby className="w-5 h-5 text-[#8ed500]" />
                    <div>
                      <p className="text-sm text-[#8ed500]">Name</p>
                      <p className="font-medium text-white">{user.baby_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#1c1c1c] rounded-lg">
                    <Calendar className="w-5 h-5 text-[#8ed500]" />
                    <div>
                      <p className="text-sm text-[#8ed500]">Date of Birth</p>
                      <p className="font-medium text-white">
                        {user.baby_date_of_birth 
                          ? new Date(user.baby_date_of_birth).toLocaleDateString()
                          : 'Not set'
                        }
                      </p>
                      {user.baby_date_of_birth && (
                        <p className="text-xs text-[#a0ff00]">{calculateAge(user.baby_date_of_birth)}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#1c1c1c] rounded-lg">
                      <p className="text-sm text-[#8ed500]">Gender</p>
                      <Badge variant="secondary" className="mt-1 bg-[#8ed500]/20 text-[#8ed500] border border-[#8ed500]/30">
                        {user.gender || 'Not set'}
                      </Badge>
                    </div>
                    <div className="p-3 bg-[#1c1c1c] rounded-lg">
                      <p className="text-sm text-[#8ed500]">Blood Group</p>
                      <Badge variant="secondary" className="mt-1 bg-[#8ed500]/20 text-[#8ed500] border border-[#8ed500]/30">
                        {user.blood_group || 'Not set'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Parent Information Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-xl border-[#333] bg-[#141414]">
              <CardHeader className="border-b border-[#333]">
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <UserIcon className="w-5 h-5 text-[#8ed500]" />
                  Parent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#1c1c1c] rounded-lg">
                    <UserIcon className="w-5 h-5 text-[#8ed500]" />
                    <div>
                      <p className="text-sm text-[#8ed500]">Name</p>
                      <p className="font-medium text-white">{user.parent_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#1c1c1c] rounded-lg">
                    <Mail className="w-5 h-5 text-[#8ed500]" />
                    <div>
                      <p className="text-sm text-[#8ed500]">Email</p>
                      <p className="font-medium text-white">{user.parent_email || user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#1c1c1c] rounded-lg">
                    <Phone className="w-5 h-5 text-[#8ed500]" />
                    <div>
                      <p className="text-sm text-[#8ed500]">Mobile</p>
                      <p className="font-medium text-white">{user.parent_mobile}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Address Information Card */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-xl border-[#333] bg-[#141414]">
            <CardHeader className="border-b border-[#333]">
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Home className="w-5 h-5 text-[#8ed500]" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#1c1c1c] rounded-lg">
                  <p className="text-sm text-[#8ed500] font-medium">Address</p>
                  <p className="mt-1 text-white">{user.address}</p>
                </div>
                <div className="p-4 bg-[#1c1c1c] rounded-lg">
                  <p className="text-sm text-[#8ed500] font-medium">City</p>
                  <p className="mt-1 text-white">{user.city}</p>
                </div>
                <div className="p-4 bg-[#1c1c1c] rounded-lg">
                  <p className="text-sm text-[#8ed500] font-medium">State & PIN</p>
                  <p className="mt-1 text-white">{user.state} - {user.pin_code}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Information Card */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-xl border-[#333] bg-[#141414]">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-400">
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Username:</span> 
                    <Badge variant="outline" className="text-xs border-[#333] text-gray-300">{user.username}</Badge>
                  </p>
                  <p>Account created: {new Date(user.created_at).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(user.updated_at).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className="border-[#8ed500]/30 text-[#8ed500] bg-[#8ed500]/10">
                  Active Account
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
       
      </div>
    </motion.div>
  )
}

export default ProfilePage