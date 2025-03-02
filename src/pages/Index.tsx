
import Navbar from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { ClientSection } from "@/components/sections/ClientSection";
import { IntegrationSection } from "@/components/sections/IntegrationSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { AISection } from "@/components/sections/AISection";
import { CTASection } from "@/components/sections/CTASection";
import { SaaSFooter } from "@/components/sections/SaaSFooter";
import AIDispatchSection from "@/components/sections/AIDispatchSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ClientSection />
      <IntegrationSection />
      <AIDispatchSection />
      <CTASection />
      <TeamSection />
      <AISection />
      <SaaSFooter />
    </div>
  );
};

export default Index;
