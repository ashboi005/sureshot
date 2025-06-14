import { Card, CardContent, CardHeader, CardTitle } from "./ui/display"
import { Progress } from "./ui/feedback"

export function CoverageStats() {
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">76%</div>
          <p className="text-xs text-muted-foreground mb-2">Target: 95%</p>
          <Progress value={76} className="h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">High Coverage Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground mb-2">Areas with &gt;90% coverage</p>
          <Progress value={60} className="h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Low Coverage Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground mb-2">Areas with &lt;50% coverage</p>
          <Progress value={25} className="h-2" />
        </CardContent>
      </Card>
    </>
  )
}
