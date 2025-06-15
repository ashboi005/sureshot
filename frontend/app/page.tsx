import Hero from "@/components/landing-page/Hero";
import Navbar from "@/components/landing-page/navbar";
import Features from "@/components/landing-page/features";
import Footer from "@/components/landing-page/footer";
import { InstallAppCardWrapper } from "@/components/install-app-card-wrapper";

export default function Page() {
  return (
    <main className="bg-[#141414] text-white">
      <Navbar />
      <Hero />      <Features />
        {/* App Installation Card */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <InstallAppCardWrapper className="bg-[#1A1A1A] border-primary/20 text-white" />
      </div>
      
      <Footer />
    </main>
  );  
}