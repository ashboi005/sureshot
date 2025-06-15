import Hero from "@/components/landing-page/Hero";
import Navbar from "@/components/landing-page/navbar";
import Features from "@/components/landing-page/features";
import Footer from "@/components/landing-page/footer";

export default function Page() {
  return (
    <main className="bg-[#141414] text-white">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );  
}