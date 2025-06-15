"use client"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/display/avatar"
import { Badge } from "../ui/core/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/data/table"
import { Phone, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { api, WorkerResponse } from "@/lib/api"

export function DriveWorkersList() {
  const [workers, setWorkers] = useState<WorkerResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkers()
  }, [])
  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const response = await api.getWorkers(0, 5) // Get first 5 workers for dashboard
      setWorkers(response.workers || [])
    } catch (error) {
      console.error('Error fetching workers:', error)
      setWorkers([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading workers...</span>
      </div>
    )
  }

  if (workers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No workers found.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Worker</TableHead>
          <TableHead>Specialization</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Experience</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workers.map((worker) => (
          <TableRow key={worker.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt={`${worker.first_name} ${worker.last_name}`} />
                  <AvatarFallback>{worker.first_name?.[0] || 'W'}{worker.last_name?.[0] || 'R'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{worker.first_name} {worker.last_name}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {worker.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{worker.specialization}</TableCell>
            <TableCell>{worker.city_name}</TableCell>
            <TableCell>
              <Badge variant={worker.is_active ? "default" : "outline"}>
                {worker.is_active ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </TableCell>
            <TableCell>{worker.experience_years} years</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
