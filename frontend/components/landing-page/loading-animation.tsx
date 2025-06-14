"use client";

import { motion } from "framer-motion";

interface LoadingAnimationProps {
  loadingProgress: number;
}

export default function LoadingAnimation({ loadingProgress }: LoadingAnimationProps) {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20"
    >
      <div className="w-32 h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke="#10b981"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: loadingProgress / 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              strokeDasharray: "251.2",
              strokeDashoffset: "0",
              transformOrigin: "center",
              transform: "rotate(-90deg)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-emerald-600 font-medium text-xl">
            {loadingProgress}%
          </p>
        </div>
      </div>
      <p className="mt-4 text-gray-700 font-medium">Loading 3D Model...</p>
    </motion.div>
  );
}