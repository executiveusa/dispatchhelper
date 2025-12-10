
import { Database, Server, Network, Users, Code, Globe, Zap, Clock, Shield } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-400 rounded-md backdrop-blur-sm mb-4">
            <span className="text-blue-300 font-mono text-sm tracking-widest">[ CLASSIFIED CAPABILITIES ]</span>
          </div>
        </div>
        <h2 className="text-4xl font-mono font-bold mb-4 text-center text-blue-400 tracking-wider">
          MISSION SYSTEMS
        </h2>
        <p className="text-center text-lg text-gray-300 max-w-2xl mx-auto mb-12">
          Advanced intelligence tools engineered for precision dispatch operations
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Intelligence Processing"
            description="AI-powered signal analysis categorizes and prioritizes incoming communications with 98% accuracy. Critical intel reaches command instantly."
            icon={Zap}
          />
          <FeatureCard
            title="Tactical Response System"
            description="Context-aware communication protocols generate mission-appropriate responses, cutting reaction time by 75% in field operations."
            icon={Server}
          />
          <FeatureCard
            title="Agent Network Coordination"
            description="Real-time coordination hub connects all field operatives. Seamless handoffs and shared intelligence eliminate operational blind spots."
            icon={Users}
          />
          <FeatureCard
            title="Mission Automation Protocol"
            description="Custom operation sequences execute automatically based on field conditions. No technical expertise required to configure mission parameters."
            icon={Database}
          />
          <FeatureCard
            title="Operations Analytics"
            description="Advanced metrics tracking monitors agent response rates, mission completion times, and operational efficiency across all active protocols."
            icon={Clock}
          />
          <FeatureCard
            title="Classified Security"
            description="Military-grade encryption with SOC 2 compliance. Role-based clearance levels ensure mission data remains secure and compartmentalized."
            icon={Shield}
          />
        </div>
        
        {/* Spy gadget images */}
        <div className="flex justify-center items-center gap-8 mt-16 flex-wrap">
          <img src="/photos/gadgets/communication-device.svg" alt="Communication System" className="w-40 h-40 opacity-60 hover:opacity-100 transition-opacity" />
          <img src="/photos/gadgets/tracking-system.svg" alt="Tracking System" className="w-40 h-40 opacity-60 hover:opacity-100 transition-opacity" />
          <img src="/photos/gadgets/intelligence-hub.svg" alt="Intelligence Hub" className="w-40 h-40 opacity-60 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </section>
  );
};
