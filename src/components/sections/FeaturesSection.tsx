
import { Database, Server, Network, Users, Code, Globe } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-mono font-bold mb-12 text-center text-blue-600">
          /POWERFUL FEATURES
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Cloud Infrastructure"
            description="Enterprise-grade cloud architecture with 99.99% uptime guarantee and global edge network for optimal performance."
            icon={Server}
          />
          <FeatureCard
            title="Intelligent Automation"
            description="Advanced AI-powered workflows that adapt to your business needs and automate repetitive tasks."
            icon={Database}
          />
          <FeatureCard
            title="Team Collaboration"
            description="Seamless collaboration tools with real-time updates, version control, and role-based permissions."
            icon={Users}
          />
        </div>
      </div>
    </section>
  );
};
