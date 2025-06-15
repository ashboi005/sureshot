import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScheduleList } from "../components/dashboard/schedule-list"

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            View and manage vaccination drive schedules
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Drives</CardTitle>
            <CardDescription>
              Scheduled vaccination drives and their timelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}