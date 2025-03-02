
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
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
      
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Try Our New AI Dispatch System</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Experience the next generation of AI-powered dispatch automation with our cutting-edge solution.
          </p>
          <Link to="/ai-dispatch">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Launch AI Dispatch
            </Button>
          </Link>
        </div>
      </section>
      
      <SaaSFooter />
    </div>
  );
};

export default Index;
