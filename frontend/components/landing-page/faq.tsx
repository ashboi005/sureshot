"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Faq() {
  const faqs = [
    {
      id: 1,
      question: "How does VaxTrack help improve vaccination rates?",
      answer: "VaxTrack automates patient reminders, identifies gaps in vaccination coverage, and provides tools for targeted outreach campaigns. Healthcare providers using our system report an average increase of 25% in vaccination completion rates."
    },
    {
      id: 2,
      question: "Is VaxTrack compliant with healthcare data regulations?",
      answer: "Yes, VaxTrack is fully HIPAA compliant and adheres to regional data protection regulations including GDPR in Europe. We employ end-to-end encryption, regular security audits, and strict access controls to protect all patient data."
    },
    {
      id: 3,
      question: "Can VaxTrack integrate with existing electronic health record (EHR) systems?",
      answer: "Absolutely. VaxTrack features robust API integrations with leading EHR systems including Epic, Cerner, Allscripts, and others. Our team provides full support for custom integrations with proprietary systems as well."
    },
    {
      id: 4,
      question: "What kind of training and support does VaxTrack offer?",
      answer: "We provide comprehensive onboarding including live training sessions, detailed documentation, video tutorials, and a dedicated support team. Our premium plans include a dedicated account manager and 24/7 technical support."
    },
    {
      id: 5,
      question: "How quickly can we implement VaxTrack in our healthcare facility?",
      answer: "Most clients are fully operational within 2-4 weeks from sign-up. Our streamlined implementation process includes data migration, system configuration, staff training, and a phased rollout to ensure minimal disruption to your operations."
    },
    {
      id: 6,
      question: "Does VaxTrack work for all types of vaccinations?",
      answer: "Yes, VaxTrack is designed to handle all types of vaccines including routine immunizations, seasonal vaccines like influenza, and specialized vaccines for travel, occupational health, and pandemic response."
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Find answers to common questions about VaxTrack's platform and services.
          </p>
        </motion.div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <button
                className="flex justify-between items-center w-full px-6 py-4 text-left text-lg font-medium text-gray-900 focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <svg
                  className={`w-6 h-6 text-emerald-600 transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-gray-700 mb-4">
            Still have questions? We're here to help.
          </p>
          <button
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </section>
  );
}
