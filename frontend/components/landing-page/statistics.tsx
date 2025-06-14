"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Statistics() {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.disconnect();
      }
    };
  }, []);

  const stats = [
    {
      id: 1,
      value: 5000,
      label: "Healthcare Providers",
      suffix: "+",
      duration: 2.5,
    },
    {
      id: 2,
      value: 2.5,
      label: "Million Vaccines Tracked",
      suffix: "M+",
      duration: 3,
    },
    {
      id: 3,
      value: 97,
      label: "Patient Satisfaction",
      suffix: "%",
      duration: 2,
    },
    {
      id: 4,
      value: 35,
      label: "Countries Served",
      suffix: "+",
      duration: 2.5,
    },
  ];

  return (
    <section className="py-16 bg-emerald-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Impacting Global Health</h2>
          <p className="max-w-2xl mx-auto text-xl opacity-90">
            VaxTrack is helping healthcare providers worldwide improve vaccination rates and patient outcomes.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >              <div className="text-4xl md:text-5xl font-bold mb-2">
                {inView ? (
                  <>
                    {stat.value % 1 !== 0 ? stat.value.toFixed(1) : stat.value}
                    {stat.suffix}
                  </>
                ) : (
                  "0"
                )}
              </div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
