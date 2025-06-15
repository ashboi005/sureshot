"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
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
import { setAuthCookies } from "@/app/actions/auth"
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof formSchema>

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
      ); console.log('Doctor ID response:', response.data);
      if (response.data?.doctor_id) {
        setDoctorId(response.data.doctor_id);

        setDoctorDetails({
          doctorId: response.data.doctor_id,
          specialization: response.data.specialization,
          hospitalAffiliation: response.data.hospital_affiliation
        });

        console.log('Doctor ID stored in atom:', response.data.doctor_id);
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
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    autoFocus
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="/auth/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
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
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/auth/sign-up" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}