import { Badge } from "./ui/core"
import { Button } from "./ui/core"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/data"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const recentDrives = [
  {
    id: "1",
    name: "Polio Vaccination Drive - North District",
    startDate: "2023-06-10",
    endDate: "2023-06-15",
    status: "ACTIVE",
    progress: 65,
    workers: 12,
  },
  {
    id: "2",
    name: "BCG Vaccination - Central Hospital",
    startDate: "2023-06-05",
    endDate: "2023-06-20",
    status: "ACTIVE",
    progress: 42,
    workers: 8,
  },
  {
    id: "3",
    name: "MMR Vaccination - South District",
    startDate: "2023-05-25",
    endDate: "2023-06-10",
    status: "COMPLETED",
    progress: 100,
    workers: 15,
  },
  {
    id: "4",
    name: "Hepatitis B - East Community Center",
    startDate: "2023-06-18",
    endDate: "2023-06-25",
    status: "PLANNED",
    progress: 0,
    workers: 10,
  },
]

export function RecentDrives() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date Range</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Workers</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentDrives.map((drive) => (
          <TableRow key={drive.id}>
            <TableCell className="font-medium">{drive.name}</TableCell>
            <TableCell>
              {drive.startDate} to {drive.endDate}
            </TableCell>
            <TableCell>
              <Badge
                variant={drive.status === "ACTIVE" ? "default" : drive.status === "COMPLETED" ? "secondary" : "outline"}
              >
                {drive.status}
              </Badge>
            </TableCell>
            <TableCell>{drive.progress}%</TableCell>
            <TableCell>{drive.workers}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/drives/${drive.id}`}>
                  <span className="sr-only">View details</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
