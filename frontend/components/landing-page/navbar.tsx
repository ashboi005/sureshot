"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-emerald-600">VaxTrack</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-emerald-600">
              Home
            </Link>
            <Link href="#features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600">
              Features
            </Link>
            <Link href="#about" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600">
              About
            </Link>
            <Link href="#testimonials" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600">
              Testimonials
            </Link>
            <Link href="#faq" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600">
              FAQ
            </Link>
          </div>
          
          <div className="hidden md:flex items-center">
            <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Log in
            </Link>
            <Link href="/auth/sign-up" className="ml-3 px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">
              Sign up
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-gray-100"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <motion.div 
        className="md:hidden"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-emerald-600">
            Home
          </Link>
          <Link href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600">
            Features
          </Link>
          <Link href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600">
            About
          </Link>
          <Link href="#testimonials" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600">
            Testimonials
          </Link>
          <Link href="#faq" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600">
            FAQ
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-2 space-y-1">
            <Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600">
              Log in
            </Link>
            <Link href="/auth/sign-up" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
