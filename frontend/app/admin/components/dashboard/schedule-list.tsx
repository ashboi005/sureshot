"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "../ui/core/badge"
import { CalendarDays, Clock, MapPin, Users } from "lucide-react"

const scheduleData = [
  {
    id: "1",
    name: "Polio Vaccination Drive",
    date: "2024-03-15",
    time: "09:00 AM",
    location: "North District Health Center",
    status: "upcoming",
    participants: 150,
    type: "Polio"
  },
  {
    id: "2",
    name: "COVID-19 Booster Campaign",
    date: "2024-03-18",
    time: "10:00 AM",
    location: "Central Community Hall",
    status: "scheduled",
    participants: 200,
    type: "COVID-19"
  },
  {
    id: "3",
    name: "Measles Immunization Drive",
    date: "2024-03-20",
    time: "08:30 AM",
    location: "South District School",
    status: "confirmed",
    participants: 120,
    type: "Measles"
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "scheduled":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "confirmed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export function ScheduleList() {
  return (
    <div className="space-y-4">
      {scheduleData.map((schedule) => (
        <Card key={schedule.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{schedule.name}</h3>
                  <Badge className={getStatusColor(schedule.status)}>
                    {schedule.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {schedule.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {schedule.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {schedule.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {schedule.participants} participants
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {schedule.type}
                </Badge>              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
