"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LogOut, PanelLeft, PanelRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define types for the sidebar props
interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface UserData {
  name: string;
  email?: string;
  avatarUrl?: string;
  role: string;
}

interface SimpleSidebarProps {
  navItems: NavItem[];
  userData: UserData;
  onLogout: () => Promise<void>;
  appName?: string;
  appLogo?: React.ReactNode;
}

// Icon components for the sidebar
const AppLogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="#8ed500" stroke="#8ed500" strokeWidth="1.5" />
    <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" fill="#141414" stroke="#141414" strokeWidth="0.5" />
  </svg>
);

export function SimpleSidebar({
  navItems,
  userData,
  onLogout,
  appName = "SureShot",
  appLogo = <AppLogoIcon />
}: SimpleSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
      
      await onLogout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect to login page if logout fails
      router.push("/auth/login");
    }
  };
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
    // Check if a nav item is active based on current path
  const isActive = (href: string) => {
    if (!pathname) return false;

    // Handle home/root path specially
    if (href === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    
    // Special handling for index routes
    if (href.endsWith('/') && pathname === href.slice(0, -1)) {
      return true;
    }
    
    // For other paths, check if current path starts with the nav item's href
    // This handles nested routes (e.g. /worker/drives should highlight the /worker nav item)
    // But avoid partial matches like /work matching /worker
    if (href !== '/') {
      // Exact match
      if (pathname === href) {
        return true;
      }
      
      // Check for parent route with proper path segment matching
      // For example, /worker should match /worker/drives but not /workers
      if (pathname.startsWith(href)) {
        // Make sure it's a complete path segment match
        const nextChar = pathname.charAt(href.length);
        return nextChar === '' || nextChar === '/';
      }
    }
    
    // No match found
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "m-4 rounded-[1.5rem] transition-all duration-300 shadow-lg",
        "flex flex-col h-[calc(100vh-2rem)]",
        "bg-[#141414] border border-[#333]",
        collapsed ? "w-[80px]" : "w-[240px]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center py-4 px-6",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {collapsed ? (
          <div className="flex flex-col items-center">
            {appLogo}
          </div>
        ) : (
          <>
            <div className="flex items-center">
              <Link className="flex items-center" href="/">
                <div className="text-[#8ed500]">
                  {appLogo}
                </div>
                <div className="ml-2">
                  <div className="text-xl font-bold text-white">
                    {appName}
                  </div>
                  <div className="text-xs text-[#8ed500]">
                    {userData.role}
                  </div>
                </div>
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCollapse}
              className="rounded-md p-1 hover:bg-[#333] border-none text-white"
            >
              <PanelRight />
            </motion.button>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="flex justify-center">
        <div className="h-[1px] w-[80%] bg-[#333]"></div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto gap-4 py-4 ">        {collapsed ? (
          <div className="flex flex-col items-center gap-6 pt-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCollapse}
              className="p-2 rounded-md hover:bg-[#333] text-white"
            >
              <PanelLeft />
            </motion.button>
            
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className="no-underline p-2"
              >                <motion.div
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(142, 213, 0, 0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    isActive(item.href) || item.active
                      ? "text-[#8ed500] bg-[#8ed500]/10 ring-1 ring-[#8ed500]/30" 
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {item.icon}
                </motion.div>
              </Link>
            ))}
          </div>        ) : (
          <div className="px-4 space-y-4">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className="no-underline w-full"
              >                
              <motion.div
               
                  className={cn(
                    "flex items-center gap-3 rounded-md py-2 px-3 ",
                    isActive(item.href) || item.active
                      ? "bg-[#141414] hover:bg-[#8ed500]/10 text-[#8ed500] gap-3 font-medium " 
                      : "text-gray-300 hover:text-[#8ed500]"
                  )}
                >
                  <span className={cn(
                    isActive(item.href) || item.active ? "text-[#8ed500]" : "text-gray-400"
                  )}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="mt-auto">
        {/* Divider */}
        <div className="flex justify-center">
          <div className="h-[1px] w-[80%] bg-[#333]"></div>
        </div>

        {!collapsed ? (
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-[#8ed500]">
                <AvatarImage src={userData.avatarUrl || "/placeholder-avatar.png"} />
                <AvatarFallback className="bg-[#1c1c1c] text-[#8ed500]">
                  {userData.name ? userData.name.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="text-sm text-white font-medium truncate w-24">
                  {userData.name}
                </div>
                <div className="text-xs text-gray-400">{userData.role}</div>
              </div>
            </div>
              <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(142, 213, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-[#333] text-gray-400 hover:text-white"
            >
              <LogOut size={18} />
            </motion.button>
          </div>
        ) : (
          <div className="p-4 flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8 border border-[#8ed500]">
              <AvatarImage src={userData.avatarUrl || "/placeholder-avatar.png"} />
              <AvatarFallback className="bg-[#1c1c1c] text-[#8ed500]">
                {userData.name ? userData.name.charAt(0) : "U"}
              </AvatarFallback>
            </Avatar>            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(142, 213, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-1 rounded-md hover:bg-[#333] text-gray-400 hover:text-white"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}