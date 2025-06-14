import Hero from "@/components/landing-page/Hero";
import Navbar from "@/components/landing-page/navbar";
import Features from "@/components/landing-page/features";
import Statistics from "@/components/landing-page/statistics";
import Testimonials from "@/components/landing-page/testimonials";
import About from "@/components/landing-page/about";
import Faq from "@/components/landing-page/faq";
import CtaSection from "@/components/landing-page/cta-section";
import Footer from "@/components/landing-page/footer";

export default function Page() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Statistics />
      <About />
      <Testimonials />
      <Faq />
      <CtaSection />
      <Footer />
    </main>
  );  
}