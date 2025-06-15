"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroContent() {
  return (
    <motion.div 
      className="w-full md:w-1/2 pt-16 md:pt-24 px-6 md:px-12 z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center md:text-left">
        {/* Title section */}
        <div className="mb-2">
          <h2 className="text-[#8ed500] font-bold text-xl tracking-wider">SURESHOT</h2>
        </div>
        
        {/* Content section */}
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-wider leading-tight">
            TRACK VACCINATIONS <span className="text-[#8ed500]">EFFECTIVELY</span>
          </h1>
          
          <p className="text-gray-300 mb-10 text-lg max-w-xl mx-auto md:mx-0">
            VaxTrack offers a comprehensive solution for healthcare providers 
            to track, manage, and optimize vaccination programs with real-time 
            analytics and intuitive monitoring tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#8ed500] text-[#141414] px-8 py-3 rounded font-medium text-lg w-full sm:w-auto"
              >
                Get Started
              </motion.button>
            </Link>
            <Link href="#features">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-transparent text-[#8ed500] border border-[#8ed500] px-4 py-3 rounded font-medium text-lg w-full sm:w-auto"
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}