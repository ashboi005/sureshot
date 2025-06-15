"use client"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { motion } from "framer-motion"

// Use consistent data to prevent hydration mismatch
const vaccineData = [
  { date: '2025-03-17', measles: 45000, polio: 60000, bcg: 30000, hepatitis: 25000, dpt: 40000 },
  { date: '2025-03-24', measles: 43200, polio: 58400, bcg: 31500, hepatitis: 26200, dpt: 39100 },
  { date: '2025-03-31', measles: 44500, polio: 61200, bcg: 29800, hepatitis: 24500, dpt: 41300 },
  { date: '2025-04-07', measles: 46300, polio: 59700, bcg: 32100, hepatitis: 25800, dpt: 38600 },
  { date: '2025-04-14', measles: 47500, polio: 57900, bcg: 28700, hepatitis: 27200, dpt: 42500 },
  { date: '2025-04-21', measles: 48200, polio: 62500, bcg: 31200, hepatitis: 23700, dpt: 39800 },
  { date: '2025-04-28', measles: 42700, polio: 59100, bcg: 33400, hepatitis: 26800, dpt: 41700 },
  { date: '2025-05-05', measles: 46800, polio: 60800, bcg: 29300, hepatitis: 25400, dpt: 40300 },
  { date: '2025-05-12', measles: 45600, polio: 58700, bcg: 30700, hepatitis: 24200, dpt: 38900 },
  { date: '2025-05-19', measles: 44100, polio: 61700, bcg: 32800, hepatitis: 27500, dpt: 42100 },
  { date: '2025-05-26', measles: 47900, polio: 59300, bcg: 31100, hepatitis: 25900, dpt: 40700 },
  { date: '2025-06-01', measles: 43500, polio: 57800, bcg: 29600, hepatitis: 24800, dpt: 39300 },
  { date: '2025-06-08', measles: 46200, polio: 62100, bcg: 33100, hepatitis: 26300, dpt: 41900 },
  { date: '2025-06-15', measles: 45100, polio: 58900, bcg: 30900, hepatitis: 25100, dpt: 40100 }
]

const generateVaccineData = () => {
  return vaccineData
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, duration: 0.3 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#141414] rounded-lg shadow-xl p-6 border border-[#333]"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-4 text-white">India Vaccination Chart</h2>
      </motion.div>
      
      {/* Vaccine Type Selector */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
        {Object.entries(vaccineColors).map(([vaccine, color], index) => (
          <motion.button
            variants={itemVariants}
            key={vaccine}
            onClick={() => handleVaccineToggle(vaccine)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              selectedVaccines.has(vaccine)
                ? 'text-[#141414] shadow-lg'
                : 'text-gray-300 bg-[#1c1c1c]'
            }`}
            style={{
              backgroundColor: selectedVaccines.has(vaccine) ? color : undefined,
              border: `1px solid ${selectedVaccines.has(vaccine) ? color : '#333'}`,
              opacity: selectedVaccines.has(vaccine) ? 1 : 0.7
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {vaccine.toUpperCase()}
          </motion.button>
        ))}
      </motion.div>

      {/* Main Chart */}
      <motion.div variants={itemVariants} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12, fill: '#aaa' }}
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric' 
              })}
              stroke="#555"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#aaa' }}
              tickFormatter={(value) => `${value / 1000}k`}
              stroke="#555"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1c1c1c] p-4 border border-[#333] rounded-lg shadow-lg text-white">
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
            <Legend formatter={(value) => <span className="text-gray-300">{value}</span>} />
            
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
      </motion.div>

      {/* Summary Statistics */}      <motion.div variants={itemVariants} className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(vaccineColors).map(([vaccine, color], index) => {
          // Use fixed values to prevent hydration mismatch
          const totals = {
            measles: 624700,
            polio: 836300,
            bcg: 431100,
            hepatitis: 356700,
            dpt: 566300
          };
          const avgs = {
            measles: 44621,
            polio: 59736,
            bcg: 30793,
            hepatitis: 25479,
            dpt: 40450
          };
          
          const total = totals[vaccine as keyof typeof totals];
          const avg = avgs[vaccine as keyof typeof avgs];
          
          return (
            <motion.div 
              variants={itemVariants}
              key={vaccine} 
              className="p-4 rounded-lg border bg-[#1c1c1c]"
              style={{ borderColor: color }}
              whileHover={{ 
                y: -5,
                boxShadow: `0 5px 15px rgba(0,0,0,0.3), 0 0 5px ${color}40`
              }}
            >
              <p className="font-medium" style={{ color }}>
                {vaccine.toUpperCase()}
              </p>              <p className="text-2xl font-bold text-white">
                {(total / 1000).toFixed(1)}k
              </p>
              <p className="text-sm text-gray-400">
                {avg.toLocaleString()} avg/day
              </p>
            </motion.div>
          )
        })}
      </motion.div>
     
    </motion.div>
  )
}