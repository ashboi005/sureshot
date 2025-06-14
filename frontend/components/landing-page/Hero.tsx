"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HeroContent from "./hero-content";
import LoadingAnimation from "./loading-animation";
import FeatureHighlights from "./feature-highlights";
import SyringeModel from "./Syringe-model";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  // Plunger animation handlers  // Allow users to toggle rotation by clicking on the model area  // Allow users to toggle rotation by clicking on the model area
  const toggleRotation = () => {
    setIsRotating(!isRotating);
  };
  return (
    <div className="relative flex flex-col md:flex-row items-center min-h-screen w-full overflow-hidden pt-16 lg:pt-20">
      {/* Content section */}
      <HeroContent />

      {/* 3D Model section */}
      <div 
        ref={containerRef}
        className="w-full md:w-1/2 h-[450px] md:h-[600px] relative"
      >
        <AnimatePresence>
          {isLoading && (
            <LoadingAnimation loadingProgress={loadingProgress} />
          )}
        </AnimatePresence>        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0.3 : 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full relative bg-white" 
          onClick={toggleRotation}
          style={{ cursor: 'pointer' }}
        >
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
          />
          
          {/* Three.js Model */}
          <SyringeModel
            containerRef={containerRef}
            canvasRef={canvasRef}
            setIsLoading={setIsLoading}
            setLoadingProgress={setLoadingProgress}
            isRotating={isRotating}
          />
          
          {/* Hover instructions */}
          {!isLoading && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-md text-sm pointer-events-none">
              Click to {isRotating ? 'stop' : 'start'} rotation
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Feature highlights - visible on larger screens */}
      <FeatureHighlights />
    </div>
  );
}