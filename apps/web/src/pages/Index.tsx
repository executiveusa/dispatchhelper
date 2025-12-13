
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
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="community">
        <ClientSection />
      </div>
      <div id="integrate">
        <IntegrationSection />
      </div>
      <div id="ai-dispatch">
        <AIDispatchSection />
      </div>
      <CTASection />
      <div id="team">
        <TeamSection />
      </div>
      <AISection />
      <SaaSFooter />
      <Toaster />
    </div>
  );
};

export default Index;
