"use client"

import { useEffect, useState, memo } from "react"
import { useRouter } from "next/navigation"

interface AuthWrapperProps {
  children: React.ReactNode
}

export const AuthWrapper = memo(function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fast, non-blocking auth check
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    
    if (!token) {
      router.push('/auth/login')
      return
    }

    // Immediately set as authenticated to prevent blocking
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router])

  // Fast loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-100"></div>
          <div className="flex">
            <div className="w-64 h-screen bg-gray-100"></div>
            <div className="flex-1 p-6 space-y-4">
              <div className="h-8 bg-gray-100 rounded w-1/4"></div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
})
