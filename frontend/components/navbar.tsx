"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, UserCircle } from "lucide-react"
import { User as UserType } from "@/types/User"
import { logout } from "@/app/actions/auth"
import axios from "axios"
import { useRouter } from "next/navigation"

interface NavbarProps {
  user: UserType | null | undefined
}
export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
    const getInitials = (name?: string) => {
    if (!name) return "VT";
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  const handleLogout = async() => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("doctorId");
      localStorage.removeItem("userRole");
      
      try {
        await axios.post(`/api/logout`);
      } catch (apiError) {
        console.error("API logout error:", apiError);
        // Continue with logout even if API call fails
      }
      
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect to login page if logout fails
      router.push("/auth/login");
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-xl">VaxTracker</span>
          </div>
        </div>        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.username || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username || user?.email || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ""}
                      </p>
                      {user?.account_type && (
                        <p className="text-xs leading-none mt-1">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                            {user.account_type.charAt(0).toUpperCase() + user.account_type.slice(1)}
                          </span>
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                    {user && user.account_type === 'doctor' ? (
                    <DropdownMenuItem 
                      className="cursor-pointer" 
                      onClick={() => router.push('/doctor/profile')}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Doctor Profile</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      className="cursor-pointer" 
                      onClick={() => router.push('/user/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                  )}
                  
               
                  
                  <DropdownMenuSeparator />
                    <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}