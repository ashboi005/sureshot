"use client"

import { BarChart3, Calendar, LogOut, Map, Settings, Shield, Stethoscope, Syringe, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  const menuItems = [
    {
      href: "/admin/dashboard",
      icon: BarChart3,
      label: "Dashboard",
    },
    {
      href: "/admin/drives",
      icon: Syringe,
      label: "Vaccination Drives",
    },
    {
      href: "/admin/workers",
      icon: Users,
      label: "Healthcare Workers",
    },
    {
      href: "/admin/doctors",
      icon: Stethoscope,
      label: "Doctors",
    },
    {
      href: "/admin/coverage-map",
      icon: Map,
      label: "Coverage Map",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Settings",
    },
  ]

  return (
    <div className="flex h-screen w-full flex-col bg-white border-r border-gray-200 overflow-y-auto">      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 shrink-0">
        <Shield className="h-6 w-6 text-gray-900" />
        <div className="font-semibold text-lg text-gray-900">SureShot Admin</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>      {/* Footer */}
      <div className="flex items-center justify-end p-4 border-t border-gray-200 shrink-0">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}
