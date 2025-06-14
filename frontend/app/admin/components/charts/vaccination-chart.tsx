"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    target: 500,
    actual: 400,
  },
  {
    name: "Feb",
    target: 600,
    actual: 580,
  },
  {
    name: "Mar",
    target: 550,
    actual: 600,
  },
  {
    name: "Apr",
    target: 700,
    actual: 650,
  },
  {
    name: "May",
    target: 800,
    actual: 750,
  },
  {
    name: "Jun",
    target: 900,
    actual: 850,
  },
]

export function VaccinationChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="target" name="Target" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="Actual" fill="#14b8a6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
