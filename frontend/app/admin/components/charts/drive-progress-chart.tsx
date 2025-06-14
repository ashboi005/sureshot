"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

// Sample data - in a real app, this would come from your API
const data = [
  { day: "Day 1", vaccinations: 45 },
  { day: "Day 2", vaccinations: 78 },
  { day: "Day 3", vaccinations: 65 },
  { day: "Day 4", vaccinations: 92 },
  { day: "Day 5", vaccinations: 45 },
  { day: "Day 6", vaccinations: 0 }, // Future days
  { day: "Day 7", vaccinations: 0 },
]

export function DriveProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="vaccinations"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
