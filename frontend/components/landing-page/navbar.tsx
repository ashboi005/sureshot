"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check both localStorage and cookies for auth tokens
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Check localStorage
      const accessTokenLS = localStorage.getItem("accessToken");
      const roleLS = localStorage.getItem("role");
      
      // If localStorage has the values, use them
      if (accessTokenLS) {
        setIsAuthenticated(true);
        setUserRole(roleLS);
        setIsLoading(false);
        return;
      }
      
      // If no localStorage values, check cookies (client-side)
      // This is a simplified approach - cookies typically need server-side checks
      // for security-critical apps
      try {
        const cookieString = document.cookie;
        const hasCookie = cookieString.includes('accessToken=');
        
        if (hasCookie) {
          // Extract role from cookies if possible
          const roleMatch = cookieString.match(/role=([^;]*)/);
          const roleCookie = roleMatch ? roleMatch[1] : null;
          
          setIsAuthenticated(true);
          setUserRole(roleCookie);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Function to get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!isAuthenticated) return "/auth/login";
    
    switch (userRole?.toUpperCase()) {
      case "ADMIN":
        return "/admin/dashboard";
      case "DOCTOR":
        return "/doctor";
      case "WORKER":
        return "/worker";
      case "USER":
      default:
        return "/user";
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    
    // Use the server action to clear cookies and redirect
    await logout();
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#141414]/90 backdrop-blur-md rounded-xl shadow-lg shadow-[#8ed500]/10">
          <div className="relative flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-[#8ed500] to-[#a5f506] bg-clip-text text-transparent">
                  SureShot
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link 
                href="/" 
                className="text-white hover:text-[#8ed500] px-2 py-1 text-sm font-medium transition-colors duration-200"
              >
                Home
              </Link>
              <Link 
                href="#features" 
                className="text-gray-300 hover:text-[#8ed500] px-2 py-1 text-sm font-medium transition-colors duration-200"
              >
                Features
              </Link>
              
              {/* Auth Buttons */}
              <div className="flex items-center ml-8 space-x-4">
                {isLoading ? (
                  <div className="w-24 h-8 bg-gray-700/30 animate-pulse rounded-lg"></div>
                ) : isAuthenticated ? (
                  <>
                    <Link
                      href={getDashboardUrl()}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium text-black bg-[#8ed500] hover:bg-[#a5f506] transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-1.5 text-sm font-medium text-[#8ed500] border border-[#8ed500]/50 rounded-lg hover:bg-[#8ed500]/10 transition-all duration-200"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/login" 
                      className="px-4 py-1.5 text-sm font-medium text-[#8ed500] border border-[#8ed500]/50 rounded-lg hover:bg-[#8ed500]/10 transition-all duration-200"
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/auth/sign-up" 
                      className="px-4 py-1.5 rounded-lg text-sm font-medium text-black bg-[#8ed500] hover:bg-[#a5f506] transition-all duration-200"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-[#8ed500]/20 transition-colors duration-200"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden"
              >
                <div className="px-4 pt-2 pb-4 border-t border-gray-700/50 space-y-1">
                  <Link
                    href="/"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#8ed500]/10 hover:text-[#8ed500] transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="#features"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-[#8ed500]/10 hover:text-[#8ed500] transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </Link>
                  
                  {/* Mobile Auth Buttons */}
                  <div className="pt-2 space-y-2">
                    {isLoading ? (
                      <div className="w-full h-10 bg-gray-700/30 animate-pulse rounded-md"></div>
                    ) : isAuthenticated ? (
                      <>
                        <Link
                          href={getDashboardUrl()}
                          className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-black bg-[#8ed500] hover:bg-[#a5f506] transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-[#8ed500] border border-[#8ed500]/50 hover:bg-[#8ed500]/10 transition-colors duration-200"
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-[#8ed500] border border-[#8ed500]/50 hover:bg-[#8ed500]/10 transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          Log in
                        </Link>
                        <Link
                          href="/auth/sign-up"
                          className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-black bg-[#8ed500] hover:bg-[#a5f506] transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}