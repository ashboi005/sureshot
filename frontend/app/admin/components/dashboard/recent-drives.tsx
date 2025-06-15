"use client"

import { Badge } from "../ui/core/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/data/table"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { api, VaccinationDriveResponse } from "@/lib/api"
import { format } from "date-fns"

export function RecentDrives() {
  const [drives, setDrives] = useState<VaccinationDriveResponse[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchRecentDrives()
  }, [])

  const fetchRecentDrives = async () => {
    try {
      setLoading(true)
      const response = await api.getVaccinationDrives(0, 5, undefined, false) // Get recent 5 drives, all statuses
      setDrives(response.drives || [])
    } catch (error) {
      console.error('Error fetching recent drives:', error)
      setDrives([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (drive: VaccinationDriveResponse) => {
    const now = new Date()
    const startDate = new Date(drive.start_date)
    const endDate = new Date(drive.end_date)

    if (now < startDate) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">PLANNED</Badge>
    } else if (now >= startDate && now <= endDate) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">ACTIVE</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">COMPLETED</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading drives...</span>
      </div>
    )
  }

  if (drives.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No vaccination drives found.
      </div>
    )
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            <TableHead className="text-gray-700">Drive Name</TableHead>
            <TableHead className="text-gray-700">City</TableHead>
            <TableHead className="text-gray-700">Start Date</TableHead>
            <TableHead className="text-gray-700">End Date</TableHead>
            <TableHead className="text-gray-700">Status</TableHead>
            <TableHead className="text-gray-700">Workers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drives.map((drive) => (
            <TableRow key={drive.id} className="border-gray-200 hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">
                {drive.vaccination_name}
              </TableCell>
              <TableCell className="text-gray-600">{drive.vaccination_city}</TableCell>
              <TableCell className="text-gray-600">
                {format(new Date(drive.start_date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-gray-600">
                {format(new Date(drive.end_date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {getStatusBadge(drive)}
              </TableCell>
              <TableCell className="text-gray-600">
                {drive.assigned_workers?.length || 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="p-4 border-t border-gray-200">
        <Link href="/admin/drives">
          <Button 
            variant="outline" 
            className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
          >
            View All Drives
          </Button>
        </Link>
      </div>
    </div>
  )
}
