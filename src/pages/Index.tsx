import { memo } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import DomainsSection from "@/components/landing/DomainsSection";
import ProcessSection from "@/components/landing/ProcessSection";
import OutcomesSection from "@/components/landing/OutcomesSection";
import SponsorsSection from "@/components/landing/SponsorsSection";
import FeeSection from "@/components/landing/FeeSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/Footer";

const Index = memo(() => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <DomainsSection />
      <ProcessSection />
      <OutcomesSection />
      <SponsorsSection />
      <FeeSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
});
Index.displayName = "Index";

export default Index;
