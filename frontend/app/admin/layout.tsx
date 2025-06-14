import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "./components/theme-provider"
import { AdminSidebar } from "./components/admin-sidebar"
import { MobileNav } from "./components/mobile-nav"
import { Toaster } from "./components/ui/feedback"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vaccination Management System - Admin Portal",
  description: "Admin portal for managing vaccination drives and healthcare workers",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background">
            {/* Mobile Navigation */}
            <MobileNav />
            
            <div className="flex">
              {/* Fixed Sidebar - hidden on mobile */}
              <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-screen lg:w-64 lg:block">
                <AdminSidebar />
              </div>
              
              {/* Main Content with left margin on desktop and top padding on mobile */}
              <main className="flex-1 lg:ml-64 min-h-screen w-full">
                <div className="p-4 pt-16 lg:pt-6 lg:p-6 space-y-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
