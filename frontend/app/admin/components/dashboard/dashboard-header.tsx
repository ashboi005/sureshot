import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin! Here's an overview of your vaccination campaigns.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Date Range</span>
        </Button>
        <Button>Generate Report</Button>
      </div>
    </div>
  )
}
