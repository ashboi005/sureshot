"use client"

import { IconTrendingDown, IconTrendingUp,  IconCalendarEvent, IconAlertTriangle, IconVaccine } from "@tabler/icons-react"
import { motion } from "framer-motion"
import { Clock, Syringe } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Current date and user login
const CURRENT_DATE_TIME = "2025-06-15 15:57:14";
const CURRENT_USER = "HarnoorSingh1234";

interface SectionCardsProps {
  vaccinesTaken?: number;
  vaccinationDrivesUpcoming?: number;
  vaccinationsLeft?: number;
  importantDrives?: number;
}

export function SectionCards({vaccinesTaken, vaccinationDrivesUpcoming, vaccinationsLeft, importantDrives}: SectionCardsProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        stiffness: 100,
        damping: 12
      }
    }
  };

  const infoVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delay: 0.5
      }
    }
  };

  const cards = [
    {
      title: "Vaccines Previously Taken",
      value: vaccinesTaken || 0,
      icon: <Syringe className="h-8 w-8 text-[#8ed500]" />,
      gradient: "from-[#8ed500]/10 to-[#8ed500]/5"
    },
    {
      title: "Vaccination Drives Upcoming",
      value: vaccinationDrivesUpcoming || 0,
      icon: <IconCalendarEvent className="h-8 w-8 text-blue-400" />,
      gradient: "from-blue-500/10 to-blue-500/5"
    },
    {
      title: "Vaccinations Left",
      value: vaccinationsLeft || 0,
      icon: <IconVaccine className="h-8 w-8 text-purple-400" />,
      gradient: "from-purple-500/10 to-purple-500/5"
    },
    {
      title: "Important Drives",
      value: importantDrives || 0,
      icon: <IconAlertTriangle className="h-8 w-8 text-amber-400" />,
      gradient: "from-amber-500/10 to-amber-500/5"
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 lg:px-6"
    >
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div key={index} variants={cardVariants} className="@container/card">
            <Card className={`bg-[#141414] border-[#333] hover:border-[#8ed500]/30 transition-colors shadow-md overflow-hidden`}>
              <div className={`absolute inset-0 opacity-20 ${card.gradient}`}></div>
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-gray-400 font-medium mb-1">{card.title}</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
                      {card.value.toLocaleString()}
                    </CardTitle>
                  </div>
                  <div className="bg-[#1c1c1c] rounded-full p-3 border border-[#333]">
                    {card.icon}
                  </div>
                </div>
              </CardHeader>
              <div className="h-1.5 w-full bg-[#333]">
                <div 
                  className={`h-full ${
                    index === 0 ? "bg-[#8ed500]" : 
                    index === 1 ? "bg-blue-500" : 
                    index === 2 ? "bg-purple-500" : 
                    "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, card.value * 5)}%` }}
                ></div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
    
    </motion.div>
  )
}