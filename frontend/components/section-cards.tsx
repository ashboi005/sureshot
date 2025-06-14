import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
interface SectionCardsProps{
  vaccinesTaken?: number;
  vaccinationDrivesUpcoming?: number;
  vaccinationsLeft?: number;
  importantDrives?: number;
}
export function SectionCards({vaccinesTaken, vaccinationDrivesUpcoming, vaccinationsLeft,importantDrives}: SectionCardsProps) {


  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vaccines Previously Taken</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {vaccinesTaken || 0}
          </CardTitle>
         
        </CardHeader>
       
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vaccination Drives Upcoming</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {vaccinationDrivesUpcoming || 0}
          </CardTitle>
          
        </CardHeader>
      
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vaccinations left</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {vaccinationsLeft||0}
          </CardTitle>
          
        </CardHeader>

      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Important Drives</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
           {importantDrives || 0}
          </CardTitle>
         
        </CardHeader>
      
      </Card>
    </div>
  )
}
