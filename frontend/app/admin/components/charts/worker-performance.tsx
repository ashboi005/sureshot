import { Avatar, AvatarFallback, AvatarImage } from "../ui/display/avatar"
import { Progress } from "../ui/feedback/progress"

const workers = [
  {
    name: "Sophia Chen",
    initials: "SC",
    image: "/placeholder.svg?height=40&width=40",
    vaccinations: 124,
    target: 150,
  },
  {
    name: "Raj Patel",
    initials: "RP",
    image: "/placeholder.svg?height=40&width=40",
    vaccinations: 98,
    target: 100,
  },
  {
    name: "Maria Rodriguez",
    initials: "MR",
    image: "/placeholder.svg?height=40&width=40",
    vaccinations: 87,
    target: 100,
  },
  {
    name: "John Smith",
    initials: "JS",
    image: "/placeholder.svg?height=40&width=40",
    vaccinations: 76,
    target: 100,
  },
]

export function WorkerPerformance() {
  return (
    <div className="space-y-4">
      {workers.map((worker) => (
        <div key={worker.name} className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={worker.image || "/placeholder.svg"} alt={worker.name} />
            <AvatarFallback>{worker.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{worker.name}</p>
              <p className="text-sm text-muted-foreground">
                {worker.vaccinations}/{worker.target}
              </p>
            </div>
            <Progress value={(worker.vaccinations / worker.target) * 100} />
          </div>
        </div>
      ))}
    </div>
  )
}
