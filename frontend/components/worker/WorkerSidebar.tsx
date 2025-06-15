"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SimpleSidebar } from "@/components/CustomSidebar";
import { 
  HomeIcon, 
  CalendarDays, 
  X,
  Menu,
  ChevronRight,
  UserCircle,
  LogOut,
  User
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import useUser from "@/hooks/useUser";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

// Mobile breakpoint hook
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export default function WorkerSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Current date and user info - in a real app, you might fetch this dynamically
  const currentDateTime = "2025-06-15 13:15:08";
  const currentUser = "HarnoorSingh1234";

  const handleLogout = async () => {
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
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Simplified nav items - flat list instead of sections
  const navItems = [
    {
      name: "Overview",
      href: "/worker",
      icon: <HomeIcon className={`h-5 w-5 ${pathname === "/worker" ? "text-[#8ed500]" : "text-gray-400"}`} />,
      active: pathname === "/worker",
    },
    {
      name: "Vaccination Drives",
      href: "/worker/drive",
      icon: <CalendarDays className={`h-5 w-5 ${
        pathname === "/worker/drive" || pathname.startsWith("/worker/drive/") 
          ? "text-[#8ed500]" 
          : "text-gray-400"
      }`} />,
      active: pathname === "/worker/drive" || pathname.startsWith("/worker/drive/"),
    },
  ];

  // Map user data from useUser hook to the format expected by Sidebar component
  const userData = user ? {
    name: user.username || user.parent_name || "Worker",
    email: user.email || user.parent_email || "",
    avatarUrl: user.avatar_url || "",
    role: user.account_type === "worker" ? "Worker" : "Health Worker"
  } : {
    name: "Loading...",
    email: "",
    avatarUrl: "",
    role: "Worker"
  };

  const getInitials = (name?: string) => {
    if (!name) return "VT";
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Mobile Navigation Component
  const MobileNavbar = () => (
    <nav className="sticky top-0 z-50 w-full border-b border-[#333] bg-[#141414]/95 backdrop-blur supports-[backdrop-filter]:bg-[#141414]/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-[#8ed500] flex items-center justify-center">
              <span className="text-[#141414] font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-xl text-white">SureShot</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:bg-[#333] hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-[#8ed500]/20 hover:border-[#8ed500]/40 transition-colors">
                    <AvatarFallback className="bg-gradient-to-br from-[#8ed500] to-[#8ed500]/80 text-[#141414] font-semibold">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-[#1c1c1c] border-[#333] text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user?.username || user?.email || "User"}</p>
                    <p className="text-xs leading-none text-gray-400">
                      {user?.email || ""}
                    </p>
                    {user?.account_type && (
                      <p className="text-xs leading-none mt-1">
                        <span className="px-2 py-1 rounded-full bg-[#8ed500]/10 text-[#8ed500] text-[10px] font-medium">
                          {user.account_type.charAt(0).toUpperCase() + user.account_type.slice(1)}
                        </span>
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-[#333]" />
                {user && user.account_type === 'doctor' ? (
                  <DropdownMenuItem 
                    className="cursor-pointer text-gray-300 hover:text-white hover:bg-[#333]" 
                    onClick={() => router.push('/doctor/profile')}
                  >
                    <UserCircle className="mr-2 h-4 w-4 text-[#8ed500]" />
                    <span>Doctor Profile</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    className="cursor-pointer text-gray-300 hover:text-white hover:bg-[#333]" 
                    onClick={() => router.push('/user/profile')}
                  >
                    <User className="mr-2 h-4 w-4 text-[#8ed500]" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-[#333]" />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-[#333]"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-[#141414] border-t border-[#333]"
          >
            <div className="py-2 px-4 space-y-1">
              {navItems.map((item, index) => (
                <Link key={index} href={item.href} className="no-underline">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between py-3 px-2 rounded-md ${
                      item.active 
                        ? 'bg-[#8ed500]/10 text-[#8ed500]' 
                        : 'text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        {item.icon}
                      </div>
                      <span className={`${item.active ? 'font-medium' : ''}`}>{item.name}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${item.active ? 'text-[#8ed500]' : 'text-gray-500'}`} />
                  </motion.div>
                </Link>
              ))}
            </div>
            
            
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0c0c0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ed500] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0c0c0c] flex-col">
      {isMobile ? (
        <>
          <MobileNavbar />
          <main className="flex-1 overflow-y-auto p-4 pt-2">
            {children}
          </main>
        </>
      ) : (
        <div className="flex h-screen bg-[#0c0c0c]">
          <SimpleSidebar
            navItems={navItems}
            userData={userData}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      )}
    </div>
  );
}