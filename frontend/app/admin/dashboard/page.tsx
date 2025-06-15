import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "../components/dashboard/dashboard-header"
import { DashboardStats } from "../components/dashboard/dashboard-stats"
import { RecentDrives } from "../components/dashboard/recent-drives"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardStats />
      
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Vaccination Drives</CardTitle>
            <CardDescription>Overview of the most recent vaccination drives</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentDrives />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
