"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="py-16 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 md:p-12 lg:px-16 lg:py-16 md:flex md:items-center md:justify-between">
            <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Ready to transform your vaccination management?
              </motion.h2>
              <motion.p 
                className="text-emerald-100 text-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Join thousands of healthcare providers using VaxTrack to improve patient outcomes and streamline their vaccination workflows.
              </motion.p>
            </div>
            <motion.div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 shadow"
              >
                Get Started Now
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-emerald-700 bg-opacity-60 hover:bg-opacity-70 shadow"
              >
                Schedule Demo
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
