"use client";

import { motion } from "framer-motion";

interface PlungerButtonsProps {
  handlePushPlunger: () => void;
  handleResetPlunger: () => void;
  isPlunging: boolean;
}

export default function PlungerButtons({ 
  handlePushPlunger, 
  handleResetPlunger, 
  isPlunging 
}: PlungerButtonsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePushPlunger}
        disabled={isPlunging}
        className="bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg 
                  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Push Plunger
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleResetPlunger}
        disabled={isPlunging}
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reset
      </motion.button>
    </div>
  );
}