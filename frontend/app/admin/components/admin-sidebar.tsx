"use client"

import { BarChart3, Calendar, LogOut, Map, Settings, Shield, Stethoscope, Syringe, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/core"

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path)
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
    <div className="flex h-screen w-full flex-col bg-card border-r border-border overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border shrink-0">
        <Shield className="h-6 w-6 text-primary" />
        <div className="font-semibold text-lg">VacMS Admin</div>
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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
        <ModeToggle />
        <Button variant="ghost" size="icon">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
