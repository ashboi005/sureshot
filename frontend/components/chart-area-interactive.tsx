"use client"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Generate realistic dummy vaccine data for India
const generateVaccineData = () => {
  const data = []
  const vaccines = ['measles', 'polio', 'bcg', 'hepatitis', 'dpt']
  const baseValues = {
    measles: 45000,
    polio: 60000,
    bcg: 30000,
    hepatitis: 25000,
    dpt: 40000
  }
  
  // Generate 90 days of data with realistic fluctuations
  for (let i = 90; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const entry: any = {
      date: date.toISOString().split('T')[0],
      // Weekday effect (lower on weekends)
      dayFactor: [0.6, 0.8, 1, 1, 1, 0.7, 0.5][date.getDay()],
      // Monthly campaign effect
      campaignBoost: Math.random() > 0.9 ? 1.5 + Math.random() : 1
    }
    
    vaccines.forEach(vaccine => {
      // Base value + random variation + weekday effect + campaign boost
      entry[vaccine] = Math.floor(
        baseValues[vaccine as keyof typeof baseValues] * 
        (0.9 + Math.random() * 0.2) * 
        entry.dayFactor * 
        entry.campaignBoost
      )
    })
    
    data.push(entry)
  }
  
  return data
}

const vaccineColors = {
  measles: '#FF6384',
  polio: '#36A2EB',
  bcg: '#FFCE56',
  hepatitis: '#4BC0C0',
  dpt: '#9966FF'
}

export function ChartAreaInteractive() {
  const [data] = React.useState(generateVaccineData())
  const [selectedVaccines, setSelectedVaccines] = React.useState<Set<string>>(
    new Set(['measles', 'polio', 'dpt'])
  )

  const handleVaccineToggle = (vaccine: string) => {
    const newSelection = new Set(selectedVaccines)
    newSelection.has(vaccine) ? newSelection.delete(vaccine) : newSelection.add(vaccine)
    setSelectedVaccines(newSelection)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">India Vaccination Chart</h2>
      
      {/* Vaccine Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(vaccineColors).map(([vaccine, color]) => (
          <button
            key={vaccine}
            onClick={() => handleVaccineToggle(vaccine)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              selectedVaccines.has(vaccine)
                ? 'text-white shadow-md'
                : 'text-gray-700 bg-gray-100'
            }`}
            style={{
              backgroundColor: selectedVaccines.has(vaccine) ? color : undefined,
              border: `1px solid ${selectedVaccines.has(vaccine) ? color : '#ddd'}`,
              opacity: selectedVaccines.has(vaccine) ? 1 : 0.7
            }}
          >
            {vaccine.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric' 
              })}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-4 border rounded-lg shadow-lg">
                      <p className="font-bold mb-2">
                        {new Date(payload[0].payload.date).toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      {payload
                        .filter(item => typeof item.dataKey === "string" && selectedVaccines.has(item.dataKey))
                        .map(item => (
                          <p key={item.dataKey} style={{ color: item.color }}>
                            {item.name}: <strong>{(item.value ?? 0).toLocaleString()}</strong>
                          </p>
                        ))}
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            
            {Array.from(selectedVaccines).map(vaccine => (
              <Area
                key={vaccine}
                name={vaccine.toUpperCase()}
                type="monotone"
                dataKey={vaccine}
                stroke={vaccineColors[vaccine as keyof typeof vaccineColors]}
                fill={vaccineColors[vaccine as keyof typeof vaccineColors]}
                fillOpacity={0.2}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(vaccineColors).map(([vaccine, color]) => {
          const total = data.reduce((sum, day) => sum + day[vaccine as keyof typeof day], 0)
          const avg = Math.round(total / data.length)
          
          return (
            <div 
              key={vaccine} 
              className="p-3 rounded-lg border"
              style={{ borderColor: color }}
            >
              <p className="font-medium" style={{ color }}>
                {vaccine.toUpperCase()}
              </p>
              <p className="text-2xl font-bold">
                {(total / 1000).toFixed(1)}k
              </p>
              <p className="text-sm text-gray-500">
                {avg.toLocaleString()} avg/day
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}