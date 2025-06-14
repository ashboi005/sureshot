import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/navigation/tabs"
import { DashboardHeader } from "../components/dashboard/dashboard-header"
import { DashboardStats } from "../components/dashboard/dashboard-stats"
import { RecentDrives } from "../components/dashboard/recent-drives"
import { VaccinationChart } from "../components/charts/vaccination-chart"
import { WorkerPerformance } from "../components/charts/worker-performance"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardStats />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Vaccination Progress</CardTitle>
                <CardDescription>Monthly vaccination targets vs. actual vaccinations</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <VaccinationChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Worker Performance</CardTitle>
                <CardDescription>Top performing healthcare workers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkerPerformance />
              </CardContent>
            </Card>
          </div>
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
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Detailed analytics and insights about vaccination campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Advanced analytics dashboard will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download reports for vaccination campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Reports generation interface will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
