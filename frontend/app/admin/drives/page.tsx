"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/core"
import { Input } from "../components/ui/core"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/data"
import { Badge } from "../components/ui/core"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/specialized"
import { ArrowRight, Download, Filter, MoreHorizontal, Plus, Search, Loader2, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { api, VaccinationDriveResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function VaccinationDrivesPage() {
  const [drives, setDrives] = useState<VaccinationDriveResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()

  const fetchDrives = async () => {
    try {
      setLoading(true)
      const activeOnly = filterStatus === "ACTIVE" ? true : filterStatus === "INACTIVE" ? false : undefined
      const response = await api.getVaccinationDrives(currentPage * 10, 10, undefined, activeOnly)
      setDrives(response.drives)
      setTotal(response.total)
    } catch (error) {
      console.error('Error fetching drives:', error)
      toast({
        title: "Error",
        description: "Failed to fetch vaccination drives. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrives()
  }, [currentPage, filterStatus])

  const filteredDrives = drives.filter(drive => {
    const searchString = `${drive.vaccination_name} ${drive.vaccination_city} ${drive.description}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  const totalPages = Math.ceil(total / 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading vaccination drives...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vaccination Drives</h1>
          <p className="text-muted-foreground">
            Manage and monitor vaccination campaigns across different areas
          </p>
        </div>
        <Link href="/admin/drives/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Drive
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search drives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status: {filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("ALL")}>
              All Drives
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("ACTIVE")}>
              Active Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("INACTIVE")}>
              Inactive Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Drive Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Workers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrives.map((drive) => (
              <TableRow key={drive.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{drive.vaccination_name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {drive.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{drive.vaccination_city}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(drive.start_date).toLocaleDateString()} - {new Date(drive.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.ceil((new Date(drive.end_date).getTime() - new Date(drive.start_date).getTime()) / (1000 * 3600 * 24))} days
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{drive.assigned_workers.length} workers</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={drive.is_active ? "default" : "secondary"}>
                    {drive.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(drive.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/admin/drives/${drive.id}`} className="flex items-center">
                          View Details
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Drive</DropdownMenuItem>
                      <DropdownMenuItem>Manage Workers</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Download className="mr-2 h-3 w-3" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        {drive.is_active ? "Mark Inactive" : "Mark Active"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, total)} of {total} drives
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {filteredDrives.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-muted-foreground">No vaccination drives found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm || filterStatus !== "ALL" 
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first vaccination drive."
            }
          </p>
          {(!searchTerm && filterStatus === "ALL") && (
            <div className="mt-6">
              <Link href="/admin/drives/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Drive
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
