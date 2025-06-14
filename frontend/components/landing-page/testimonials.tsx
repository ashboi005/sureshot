"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: "VaxTrack has revolutionized how we manage vaccinations in our clinic. The real-time tracking and automated reminders have significantly improved our patient follow-up rates.",
      name: "Dr. Sarah Johnson",
      title: "Medical Director, City Health Clinic",
      image: "/profiles/profile1.jpg" // You'll need to add these images to your public folder
    },
    {
      id: 2,
      quote: "The analytics provided by VaxTrack helped us identify gaps in our vaccination coverage and develop targeted outreach programs that have increased our community's immunization rates by 30%.",
      name: "Dr. Michael Chen",
      title: "Public Health Officer, Regional Health Department",
      image: "/profiles/profile2.jpg"
    },
    {
      id: 3,
      quote: "As a nurse practitioner, I appreciate how VaxTrack streamlines documentation and reduces administrative work, allowing me to focus more on patient care and education.",
      name: "Emma Rodriguez, NP",
      title: "Family Health Practice",
      image: "/profiles/profile3.jpg"
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Healthcare Professionals</h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            See what healthcare providers are saying about their experience with VaxTrack.
          </p>
        </motion.div>
        
        <div className="relative max-w-3xl mx-auto">
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-200"
          >
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4">
                <div className="w-20 h-20 bg-emerald-200 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-xl">
                    {testimonials[activeTestimonial].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg text-gray-700 italic mb-6">"{testimonials[activeTestimonial].quote}"</p>
                <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</div>
                <div className="text-sm text-gray-600">{testimonials[activeTestimonial].title}</div>
              </div>
            </div>
          </motion.div>
          
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-gray-200 hover:bg-emerald-200 transition-colors"
              aria-label="Previous testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full ${activeTestimonial === index ? 'bg-emerald-600' : 'bg-gray-300'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
            
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-gray-200 hover:bg-emerald-200 transition-colors"
              aria-label="Next testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
