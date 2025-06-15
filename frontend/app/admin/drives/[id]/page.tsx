import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "../../components/ui/feedback/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/navigation/tabs"
import { Badge } from "../../components/ui/core/badge"
import { ChevronLeft, Download, Edit, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { DriveWorkersList } from "../../components/dashboard/drive-workers-list"
import { DriveProgressChart } from "../../components/charts/drive-progress-chart"
import { DriveMap } from "../../components/maps/drive-map"

// This would come from your API in a real app
const driveData = {
  id: "1",
  name: "Polio Vaccination Drive - North District",
  targetVaccine: "Polio",
  startDate: "2023-06-10",
  endDate: "2023-06-15",
  status: "ACTIVE",
  progress: 65,
  targetChildren: 500,
  vaccinated: 325,
  pending: 175,
  workers: 12,
  targetAreaDescription:
    "North District including neighborhoods A, B, and C. Covering approximately 25 square kilometers with an estimated population of 15,000 people.",
}

export default async function DrivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/admin/drives">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{driveData.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  driveData.status === "ACTIVE" ? "default" : driveData.status === "COMPLETED" ? "secondary" : "outline"
                }
              >
                {driveData.status}
              </Badge>
              <span className="text-muted-foreground">
                {driveData.startDate} to {driveData.endDate}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Drive
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driveData.targetChildren}</div>
            <p className="text-xs text-muted-foreground">Total children to be vaccinated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vaccinated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driveData.vaccinated}</div>
            <p className="text-xs text-muted-foreground">Children vaccinated so far</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driveData.pending}</div>
            <p className="text-xs text-muted-foreground">Children yet to be vaccinated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthcare Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driveData.workers}</div>
            <p className="text-xs text-muted-foreground">Workers assigned to this drive</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-7 md:col-span-4">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              {driveData.progress}% complete ({driveData.vaccinated} of {driveData.targetChildren} children)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={driveData.progress} className="h-2" />
            <div className="mt-6">
              <DriveProgressChart />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-7 md:col-span-3">
          <CardHeader>
            <CardTitle>Target Area</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              North District
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">{driveData.targetAreaDescription}</p>
            </div>
            <div className="h-[200px] rounded-md border">
              <DriveMap />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workers">
            <Users className="h-4 w-4 mr-2" />
            Assigned Workers
          </TabsTrigger>
          <TabsTrigger value="children">Target Children</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Healthcare Workers</CardTitle>
                <CardDescription>Workers assigned to this vaccination drive</CardDescription>
              </div>
              <Button size="sm">Assign Workers</Button>
            </CardHeader>
            <CardContent>
              <DriveWorkersList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="children">
          <Card>
            <CardHeader>
              <CardTitle>Target Children</CardTitle>
              <CardDescription>List of children targeted in this vaccination drive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Children list will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Drive Timeline</CardTitle>
              <CardDescription>Timeline of events for this vaccination drive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Timeline will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
