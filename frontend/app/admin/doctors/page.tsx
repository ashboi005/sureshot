"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "../components/ui/core/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/data/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/specialized/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/display/avatar"
import { Filter, MoreHorizontal, Phone, Plus, Search, Stethoscope, MapPin, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { api, DoctorResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await api.getDoctors(currentPage * 10, 10)
      // Filter locally based on status if needed
      let filteredDoctors = response.doctors
      if (filterStatus === "ACTIVE") {
        filteredDoctors = response.doctors.filter(doctor => doctor.is_active)
      } else if (filterStatus === "INACTIVE") {
        filteredDoctors = response.doctors.filter(doctor => !doctor.is_active)
      }
      setDoctors(filteredDoctors)
      setTotal(response.total)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast({
        title: "Error",
        description: "Failed to fetch doctors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [currentPage, filterStatus])

  const filteredDoctors = doctors.filter(doctor => {
    const searchString = `${doctor.first_name} ${doctor.last_name} ${doctor.email} ${doctor.specialization}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  const totalPages = Math.ceil(total / 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading doctors...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">
            Manage medical professionals and their profiles
          </p>
        </div>
        <Link href="/admin/doctors/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search doctors..."
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
              All Doctors
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
              <TableHead>Doctor</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>
                        {doctor.first_name[0]}{doctor.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        Dr. {doctor.first_name} {doctor.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {doctor.username}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span>{doctor.specialization}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span>{doctor.experience_years} years</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{doctor.hospital_affiliation}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={doctor.is_active ? "default" : "secondary"}>
                    {doctor.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{doctor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Joined: {new Date(doctor.created_at).toLocaleDateString()}
                      </span>
                    </div>
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Information</DropdownMenuItem>
                      <DropdownMenuItem>View Schedule</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        {doctor.is_active ? "Mark Inactive" : "Mark Active"}
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
            Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, total)} of {total} doctors
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

      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-12">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-muted-foreground">No doctors found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm || filterStatus !== "ALL" 
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first doctor."
            }
          </p>
          {(!searchTerm && filterStatus === "ALL") && (
            <div className="mt-6">
              <Link href="/admin/doctors/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Doctor
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
