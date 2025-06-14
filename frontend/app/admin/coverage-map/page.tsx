import { Button } from "../components/ui/core"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/display"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/forms"
import { CoverageMap } from "../components/coverage-map"
import { CoverageStats } from "../components/coverage-stats"

export default function CoverageMapPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coverage Map</h1>
          <p className="text-muted-foreground">Geographical view of vaccination coverage</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select vaccine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vaccines</SelectItem>
              <SelectItem value="polio">Polio</SelectItem>
              <SelectItem value="bcg">BCG</SelectItem>
              <SelectItem value="mmr">MMR</SelectItem>
              <SelectItem value="dtp">DTP</SelectItem>
              <SelectItem value="hepb">Hepatitis B</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Filter</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CoverageStats />
      </div>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Vaccination Coverage Map</CardTitle>
          <CardDescription>Geographical distribution of vaccination coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-md border">
            <CoverageMap />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
