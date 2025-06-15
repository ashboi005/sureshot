"use client"

import { useState } from 'react';
import { motion } from "framer-motion";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.3 
    }
  }
}

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
}

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const forgotPassword = async(email:string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {email})
      if(response.status === 200){
        toast.success('Password reset link sent to your email')
        return true;
      } else {
        toast.error('Failed to send password reset link')
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 
          error.request ? 'Network error' : 'Failed to send password reset link'
        toast.error(errorMessage)
      } else {
        toast.error('An unexpected error occurred')
      }
      return false;
    }
  }
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const success = await forgotPassword(data.email);
      if (success) {
        setIsSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0c0c0c]"
    >
      <motion.div
        variants={itemVariants}
        className="w-full max-w-md"
      >
        <Card className="bg-[#141414] border-[#333] shadow-xl">
          <CardHeader className="text-center space-y-4 border-b border-[#333]">
            {isSuccess ? (
              <>
                <div className="mx-auto w-16 h-16 bg-[#8ed500]/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#8ed500]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
                  </CardDescription>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-[#8ed500]/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-[#8ed500]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Forgot your password?</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    No worries! Enter your email address and we'll send you a link to reset your password.
                  </CardDescription>
                </div>
              </>
            )}
          </CardHeader>
          
          <CardContent className="pt-6 space-y-4">
            {isSuccess ? (
              <div className="space-y-6">
                <div className="text-center text-sm text-gray-400">
                  Didn't receive the email? Check your spam folder or try again.
                </div>
                <div className="flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsSuccess(false);
                        form.reset();
                      }}
                      className="w-full border-[#333] text-gray-300 hover:bg-[#333] hover:text-white"
                    >
                      Try again
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => router.push('/auth/login')} 
                      className="w-full bg-[#8ed500] text-[#141414] hover:bg-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to login
                    </Button>
                  </motion.div>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-[#8ed500]" />
                            <Input
                              placeholder="Enter your email address"
                              className="pl-10 bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500] focus:ring-[#8ed500]"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#8ed500] text-[#141414] hover:bg-white transition-colors" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending reset link...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send reset link
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  {!isLoading && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white hover:bg-[#333]"
                        onClick={() => router.push('/auth/login')}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                      </Button>
                    </motion.div>
                  )}
                </form>
              </Form>
            )}
            
            
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}