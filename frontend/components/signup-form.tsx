"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
})

type SignUpFormData = z.infer<typeof signUpSchema>

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

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, data)
      
      if (response.data?.user) {
        document.cookie = `role=${response.data.user.account_type}; Path=/; ${
          process.env.NODE_ENV === 'production' ? 'Secure; HttpOnly; SameSite=Strict' : ''
        }${response.data.expires_in ? `; Max-Age=${response.data.expires_in}` : ''}`;
        
        toast.success('A mail has been sent to your email for verification. Please check your inbox.')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail 
        toast.error(errorMessage)
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-[#141414] border-[#333] shadow-lg">
        <CardHeader className="text-center border-b border-[#333]">
          <CardTitle className="text-xl text-white">Create Account</CardTitle>
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
                    placeholder="johndoe@example.com"
                    required
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
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="JohnDoe"
                    required
                    {...register("username")}
                    className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500] focus:ring-[#8ed500]"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-400">{errors.username.message}</p>
                  )}
                </motion.div>
                
                <motion.div 
                  custom={2}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-3"
                >
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    {...register("password")}
                    className="bg-[#1c1c1c] border-[#333] text-white focus:border-[#8ed500] focus:ring-[#8ed500]"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, and a number
                  </p>
                </motion.div>
                
                <motion.div
                  custom={3}
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
                        <span>Signing Up...</span>
                      </div>
                    ) : "Sign Up"}
                  </Button>
                </motion.div>
              </div>
              
              <motion.div
                custom={4}
                variants={formItemVariants}
                initial="hidden"
                animate="visible"
                className="text-center text-sm"
              >
                <span className="text-gray-400">Already have an account?</span>{" "}
                <a 
                  href="/auth/login" 
                  className="text-[#8ed500] hover:text-white transition-colors"
                >
                  Login
                </a>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <motion.div
        custom={5}
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