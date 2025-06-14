import { Avatar, AvatarFallback, AvatarImage } from "../ui/display/avatar"
import { Badge } from "../ui/core/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/data/table"
import { MoreHorizontal, Phone } from "lucide-react"

const workers = [
  {
    id: "1",
    name: "Sophia Chen",
    initials: "SC",
    image: "/placeholder.svg?height=40&width=40",
    employeeId: "HW-2023-001",
    phone: "+1234567890",
    assignedArea: "Sector A",
    status: "ACTIVE",
    vaccinations: 42,
  },
  {
    id: "2",
    name: "Raj Patel",
    initials: "RP",
    image: "/placeholder.svg?height=40&width=40",
    employeeId: "HW-2023-008",
    phone: "+1234567891",
    assignedArea: "Sector B",
    status: "ACTIVE",
    vaccinations: 38,
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    initials: "MR",
    image: "/placeholder.svg?height=40&width=40",
    employeeId: "HW-2023-015",
    phone: "+1234567892",
    assignedArea: "Sector C",
    status: "ACTIVE",
    vaccinations: 29,
  },
  {
    id: "4",
    name: "John Smith",
    initials: "JS",
    image: "/placeholder.svg?height=40&width=40",
    employeeId: "HW-2023-022",
    phone: "+1234567893",
    assignedArea: "Sector A",
    status: "INACTIVE",
    vaccinations: 0,
  },
]

export function DriveWorkersList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Worker</TableHead>
          <TableHead>Employee ID</TableHead>
          <TableHead>Assigned Area</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Vaccinations</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workers.map((worker) => (
          <TableRow key={worker.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={worker.image || "/placeholder.svg"} alt={worker.name} />
                  <AvatarFallback>{worker.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{worker.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {worker.phone}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{worker.employeeId}</TableCell>
            <TableCell>{worker.assignedArea}</TableCell>
            <TableCell>
              <Badge variant={worker.status === "ACTIVE" ? "default" : "outline"}>{worker.status}</Badge>
            </TableCell>
            <TableCell>{worker.vaccinations}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
