"use client"

import { Activity, CheckCircle, Clock, Users, Stethoscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/display/card"
import { useEffect, useState } from "react"
import { adminApi, AdminDashboardStats } from "../../lib/admin-api"

interface DashboardStatsData {
  active_drives: number;
  vaccinations_completed: number;
  active_workers: number;
  upcoming_drives: number;
  active_doctors: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    active_drives: 0,
    vaccinations_completed: 0,
    active_workers: 0,
    upcoming_drives: 0,
    active_doctors: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Active Drives</CardTitle>
          <Activity className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.active_drives}
          </div>
          <p className="text-xs text-gray-500">Currently running</p>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Vaccinations Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.vaccinations_completed.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500">Total administered</p>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Active Workers</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.active_workers}
          </div>
          <p className="text-xs text-gray-500">Healthcare workers</p>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Active Doctors</CardTitle>
          <Stethoscope className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.active_doctors}
          </div>
          <p className="text-xs text-gray-500">Medical doctors</p>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Upcoming Drives</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.upcoming_drives}
          </div>
          <p className="text-xs text-gray-500">Next 30 days</p>
        </CardContent>
      </Card>
    </div>
  )
}
