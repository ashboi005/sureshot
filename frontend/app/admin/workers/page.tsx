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
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/display"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/forms"
import { Filter, MoreHorizontal, Phone, Plus, Search, Loader2, Download, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { api, type WorkerResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const cities = [
  "All Cities", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", 
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur"
]

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("All Cities")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalWorkers, setTotalWorkers] = useState(0)
  const { toast } = useToast()

  const pageSize = 10

  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const cityFilter = selectedCity === "All Cities" ? undefined : selectedCity
      const response = await api.getWorkers(currentPage * pageSize, pageSize, cityFilter)
      setWorkers(response.workers)
      setTotalWorkers(response.total)
    } catch (error) {
      console.error('Failed to fetch workers:', error)
      toast({
        title: "Error",
        description: "Failed to load workers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [currentPage, selectedCity])

  // Filter workers based on search term
  const filteredWorkers = workers.filter(worker =>
    worker.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getExperienceLevel = (years: number) => {
    if (years < 2) return { label: "Junior", variant: "secondary" as const }
    if (years < 5) return { label: "Mid-level", variant: "default" as const }
    if (years < 10) return { label: "Senior", variant: "default" as const }
    return { label: "Expert", variant: "default" as const }
  }

  const totalPages = Math.ceil(totalWorkers / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Healthcare Workers</h1>
          <p className="text-muted-foreground">Manage and monitor healthcare workers in the system</p>
        </div>
        <Link href="/admin/workers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.map((worker) => {
                const experienceLevel = getExperienceLevel(worker.experience_years)
                return (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {worker.first_name[0]}{worker.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{worker.first_name} {worker.last_name}</div>
                          <div className="text-sm text-muted-foreground">@{worker.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{worker.email}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          Contact info
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{worker.city_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{worker.specialization}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={experienceLevel.variant}>
                          {experienceLevel.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {worker.experience_years} years
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={worker.is_active ? "default" : "secondary"}>
                        {worker.is_active ? "Active" : "Inactive"}
                      </Badge>
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Contact Worker
                          </DropdownMenuItem>
                          {worker.government_id_url && (
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download ID
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalWorkers)} of {totalWorkers} workers
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
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
