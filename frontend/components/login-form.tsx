"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { useState } from "react"
import { useAtom } from "jotai"
import { doctorIdAtom, doctorDetailsAtom } from "@/lib/atoms"
import { Loader2 } from "lucide-react"
import { setAuthCookies } from "@/app/actions/auth"
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof formSchema>

const formItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: custom * 0.1,
      duration: 0.3
    }
  })
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [, setDoctorId] = useAtom(doctorIdAtom)
  const [, setDoctorDetails] = useAtom(doctorDetailsAtom)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })
  const router = useRouter()
  
  const fetchDoctorId = async (userId: string, token: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/doctors/get-doctor-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data?.doctor_id) {
        setDoctorId(response.data.doctor_id);

        setDoctorDetails({
          doctorId: response.data.doctor_id,
          specialization: response.data.specialization,
          hospitalAffiliation: response.data.hospital_affiliation
        });
      }
    } catch (error) {
      console.error('Error fetching doctor ID:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, data)
      if (response.data?.access_token) {
        const accessToken = response.data.access_token;
        const userRole = response.data.user.account_type;
        const userId = response.data.user.user_id;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userRole', userRole);

     setAuthCookies(accessToken, userRole);
        if (userRole === 'doctor') {
          await fetchDoctorId(userId, accessToken);
        }

        toast.success('Login successful!');
        router.push('/user');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail;
        toast.error(errorMessage || 'Login failed');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-[#141414] border-[#333] shadow-lg">
        <CardHeader className="text-center border-b border-[#333]">
          <CardTitle className="text-xl text-white">Welcome back</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <motion.div 
                  custom={0}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-3"
                >
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    autoFocus
                    {...register("email")}
                    className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500] focus:ring-[#8ed500]"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  )}
                </motion.div>

                <motion.div 
                  custom={1}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-3"
                >
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <a
                      href="/auth/forgot-password"
                      className="ml-auto text-sm text-[#8ed500] hover:text-white transition-colors"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    {...register("password")}
                    placeholder="••••••••"
                    className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500] focus:ring-[#8ed500]"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password.message}</p>
                  )}
                </motion.div>
                
                <motion.div
                  custom={2}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-[#8ed500] text-[#141414] hover:bg-[#a5ec1c] transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Logging in...</span>
                      </div>
                    ) : "Login"}
                  </Button>
                </motion.div>
              </div>
              
              <motion.div
                custom={3}
                variants={formItemVariants}
                initial="hidden"
                animate="visible"
                className="text-center text-sm"
              >
                <span className="text-gray-400">Don&apos;t have an account?</span>{" "}
                <a 
                  href="/auth/sign-up" 
                  className="text-[#8ed500] hover:text-white transition-colors"
                >
                  Sign up
                </a>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <motion.div
        custom={4}
        variants={formItemVariants}
        initial="hidden"
        animate="visible"
        className="text-gray-500 text-center text-xs text-balance"
      >
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-gray-400 hover:text-[#8ed500] transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-gray-400 hover:text-[#8ed500] transition-colors">
          Privacy Policy
        </a>
        .
      </motion.div>
    </div>
  )
}