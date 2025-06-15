"use client";
import { useState,useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Loader2, Eye, EyeOff, CheckCircle, Shield,AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [tokenData, setTokenData] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: string | null;
  } | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

     useEffect(() => {
const searchParams = new URLSearchParams(window.location.search);
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const expiresAt = searchParams.get('expires_at');
    if (!accessToken) {
      setTokenError('Invalid password reset link');
      toast.error('Invalid or expired password reset link');
      return;
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      setTokenError('This reset link has expired');
      toast.error('Password reset link has expired');
      router.push('/auth/forgot-password');
      return;
    }

    setTokenData({
      accessToken,
      refreshToken,
      expiresAt
    });
    setIsLoading(false);
  }, [router]);

 

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(password);



  const getStrengthText = (strength: number) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const resetPassword = async (password: string) => {
    if (!tokenData?.accessToken) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          new_password: password,
          access_token: tokenData.accessToken,
          refresh_token: tokenData.refreshToken,
        }
      );

      if (response.status === 200) {
        setIsSuccess(true);
        toast.success('Password reset successful!');
        window.history.replaceState({}, document.title, window.location.pathname);
        router.push('/auth/login');
      } else {
        toast.error(response.data?.message || 'Failed to reset password');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 
                            error.request ? 'Network error' : 'Failed to reset password';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await resetPassword(data.password);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !tokenError) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Verifying reset link</CardTitle>
            <CardDescription className="mt-2">
              Please wait while we verify your password reset link.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (tokenError) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription className="mt-2">
              {tokenError} Please request a new password reset link.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => router.push('/auth/forgot-password')} 
            className="w-full"
          >
            Request New Reset Link
          </Button>
        </CardContent>
      </Card>
    );
  }
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Password reset successful!</CardTitle>
            <CardDescription className="mt-2">
              Your password has been successfully updated. You can now log in with your new password.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="w-full"
          >
            Continue to login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription className="mt-2">
            Enter your new password below. Make sure it's strong and secure.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength < 50 ? 'text-red-600' : 
                          passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className="h-2"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Password requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center gap-2 ${
                    password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      password.length >= 8 ? 'bg-green-600' : 'bg-muted-foreground'
                    }`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-2 ${
                    /[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      /[A-Z]/.test(password) ? 'bg-green-600' : 'bg-muted-foreground'
                    }`} />
                    One uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${
                    /[a-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      /[a-z]/.test(password) ? 'bg-green-600' : 'bg-muted-foreground'
                    }`} />
                    One lowercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${
                    /[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      /[0-9]/.test(password) ? 'bg-green-600' : 'bg-muted-foreground'
                    }`} />
                    One number
                  </li>
                  <li className={`flex items-center gap-2 ${
                    /[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      /[^A-Za-z0-9]/.test(password) ? 'bg-green-600' : 'bg-muted-foreground'
                    }`} />
                    One special character
                  </li>
                </ul>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset password
                </>
              )}
            </Button>          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}