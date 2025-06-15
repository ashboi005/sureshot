"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function InfoButton() {
  const [infoVisible, setInfoVisible] = useState(false);
  
  return (
    <div className="absolute bottom-6 right-6 z-10">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setInfoVisible(!infoVisible)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.button>
      
      <AnimatePresence>
        {infoVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-0 w-64 bg-white p-4 rounded-lg shadow-xl"
          >
            <h4 className="font-medium text-gray-900 mb-2">Model Interactions:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Click and drag to rotate the model</li>
              <li>• Use mouse wheel to zoom in/out</li>
              <li>• Use the buttons to see different views</li>
              <li>• Push plunger to simulate injection</li>
            </ul>
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setInfoVisible(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}