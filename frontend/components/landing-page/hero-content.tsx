"use client";

import { motion } from "framer-motion";

export default function HeroContent() {
  return (
    <motion.div 
      className="w-full md:w-1/2 p-6 md:p-12 z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
        Track Vaccinations <span className="text-emerald-600">Effectively</span>
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        VaxTrack offers a comprehensive solution for healthcare providers 
        to track, manage, and optimize vaccination programs with real-time 
        analytics and intuitive monitoring tools.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-medium text-lg"
        >
          Get Started
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-emerald-600 border border-emerald-600 px-8 py-4 rounded-lg font-medium text-lg"
        >
          Learn More
        </motion.button>
      </div>
      
      {/* Current date display */}
      <p className="text-sm text-gray-500 mt-6">
        Last updated: 2025-06-13
      </p>
    </motion.div>
  );
}