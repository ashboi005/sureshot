"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0c0c0c] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[20px] bg-[#141414] p-[5px] overflow-hidden shadow-[0_7px_20px_0_rgba(0,0,0,0.2)]">
          {/* Top section with green accent */}
          <div className="rounded-[15px] bg-[#8ed500] h-[40px] relative">
            {/* Slanted corner */}
            <div className="absolute top-0 left-0 border-bottom-right-radius-[10px] h-[30px] w-[130px] bg-[#141414] transform -skew-x-[40deg] shadow-[-10px_-10px_0_0_#141414]"></div>
            
            <div className="absolute top-0 right-0 p-2 flex space-x-3">
              <a href="#" className="text-[#1b233d] hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-[#1b233d] hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-[#1b233d] hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Content section */}
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <span className="text-2xl font-bold text-[#8ed500] tracking-wider">VAXTRACK</span>
              </Link>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Empowering healthcare providers with modern vaccination management solutions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white text-center">Product</h3>
                <ul className="space-y-3">
                  <li className="text-center">
                    <Link href="#features" className="text-gray-400 hover:text-[#8ed500]">Features</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Pricing</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Security</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Integrations</Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white text-center">Company</h3>
                <ul className="space-y-3">
                  <li className="text-center">
                    <Link href="#about" className="text-gray-400 hover:text-[#8ed500]">About Us</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Careers</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Partners</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#testimonials" className="text-gray-400 hover:text-[#8ed500]">Testimonials</Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white text-center">Support</h3>
                <ul className="space-y-3">
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Help Center</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#faq" className="text-gray-400 hover:text-[#8ed500]">FAQs</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Contact Us</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Privacy Policy</Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white text-center">Connect</h3>
                <ul className="space-y-3">
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Twitter</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Facebook</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">Instagram</Link>
                  </li>
                  <li className="text-center">
                    <Link href="#" className="text-gray-400 hover:text-[#8ed500]">LinkedIn</Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Stats row - mimicking the bottom section of the card */}
            <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.126)]">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex justify-between w-full md:w-auto md:space-x-10 mb-6 md:mb-0">
                  <div className="text-center px-4">
                    <span className="block text-lg font-bold text-white">24/7</span>
                    <span className="text-xs text-gray-400">Support</span>
                  </div>
                  <div className="text-center px-4 border-x border-[rgba(255,255,255,0.126)]">
                    <span className="block text-lg font-bold text-white">100%</span>
                    <span className="text-xs text-gray-400">Secure</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="block text-lg font-bold text-white">1000+</span>
                    <span className="text-xs text-gray-400">Clients</span>
                  </div>
                </div>
                
                <div className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} VaxTrack. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}