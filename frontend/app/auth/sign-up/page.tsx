"use client"

import { motion } from "framer-motion"
import { Syringe } from "lucide-react"
import { SignUpForm } from "@/components/signup-form"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.3 
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      stiffness: 100,
      damping: 12
    }
  }
}

export default function SignUpPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#0c0c0c] flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
    >
      <motion.div 
        variants={itemVariants}
        className="flex w-full max-w-sm flex-col gap-6"
      >
        <motion.a 
          href="/"
          className="flex items-center gap-3 self-center font-medium text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="bg-[#8ed500] text-[#141414] flex size-10 items-center justify-center rounded-md">
            <Syringe className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">VaxTrack</span>
            <span className="text-xs text-[#8ed500]">Secure Vaccination System</span>
          </div>
        </motion.a>
        
        <motion.div variants={itemVariants}>
          <SignUpForm />
        </motion.div>
        
       
      </motion.div>
    </motion.div>
  )
}