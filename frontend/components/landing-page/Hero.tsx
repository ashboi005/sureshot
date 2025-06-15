"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import VaccineImage from "@/public/download.jpeg"; // Adjust the path as necessary"
import Image from "next/image";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);



  return (
    <div className="relative flex flex-col md:flex-row items-center min-h-screen w-full overflow-hidden pt-16 lg:pt-20 bg-[#141414]" style={{ backgroundColor: "#141414" }}>
      {/* Content section */}
      <div className="w-full md:w-1/2 p-6 md:p-12 z-10">
        <motion.div 
          className="rounded-[20px] bg-[#141414] p-[5px] overflow-hidden shadow-[0_7px_20px_0_rgba(0,0,0,0.2)] transition-transform duration-500 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          
          
          {/* Content section */}
          <div className="p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider">
              TRACK VACCINATIONS <span className="text-[#8ed500]">EFFECTIVELY</span>
            </h1>
            
            <p className="text-gray-300 mb-8">
              VaxTrack offers a comprehensive solution for healthcare providers 
              to track, manage, and optimize vaccination programs with real-time 
              analytics and intuitive monitoring tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#8ed500] text-[#141414] px-8 py-4 rounded-lg font-medium text-lg"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent text-[#8ed500] border border-[#8ed500] px-8 py-4 rounded-lg font-medium text-lg"
              >
                Learn More
              </motion.button>
            </div>
            

           
          </div>
        </motion.div>
      </div>      {/* Image section with blended edges */}
      <div 
        ref={containerRef}
        className="w-full md:w-1/2 h-[450px] md:h-[600px] relative px-4 md:px-8"
      >
        <motion.div
          className="relative h-full"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="absolute inset-0 z-10 pointer-events-none" style={{
            background: `
              radial-gradient(circle at 50% 50%, transparent 70%, #141414 100%),
              linear-gradient(to right, #141414, transparent 15%, transparent 85%, #141414),
              linear-gradient(to bottom, #141414, transparent 15%, transparent 85%, #141414)
            `
          }}></div>
          
            <div className="h-full w-full overflow-hidden">
            <Image
              src={VaccineImage}
              alt="Vaccine"
              className="w-full h-full object-cover md:scale-105 scale-105"
              onMouseEnter={() => setIsRotating(true)}
              onMouseLeave={() => setIsRotating(false)}
            />
            </div>
        </motion.div>
      </div>
      
    
    </div>
  );
}