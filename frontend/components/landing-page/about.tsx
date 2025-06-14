"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <motion.div
            className="mb-12 lg:mb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About VaxTrack</h2>
            <p className="text-lg text-gray-700 mb-6">
              VaxTrack was founded in 2023 with a mission to solve the challenges healthcare providers face in managing vaccination programs efficiently and effectively.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Our team of healthcare professionals, data scientists, and software engineers collaborated to create a comprehensive solution that addresses the real-world needs of vaccination management.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Today, VaxTrack serves thousands of healthcare providers across the globe, helping to improve vaccination rates, reduce administrative burden, and ultimately save lives through better immunization practices.
            </p>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-700">
                To empower healthcare providers with technology that simplifies vaccination management, improves patient outcomes, and contributes to global health initiatives through data-driven insights.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            className="lg:pl-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-emerald-600 mb-3">Technology-Driven</h3>
                <p className="text-gray-700">
                  Our platform leverages cutting-edge technology including real-time data processing, predictive analytics, and cloud infrastructure to provide a reliable and scalable solution.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-emerald-600 mb-3">Healthcare Expertise</h3>
                <p className="text-gray-700">
                  Developed in collaboration with medical professionals, our platform is designed to meet the specific needs and workflows of healthcare providers.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-emerald-600 mb-3">Data Security</h3>
                <p className="text-gray-700">
                  We prioritize the security and privacy of patient data with HIPAA-compliant infrastructure and end-to-end encryption for all sensitive information.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-emerald-600 mb-3">Global Impact</h3>
                <p className="text-gray-700">
                  VaxTrack is committed to improving global health outcomes by making advanced vaccination management accessible to healthcare providers worldwide.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
