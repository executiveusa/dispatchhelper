
import { Database, Server, Network, Users, Code, Globe, Zap, Clock, Shield } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-mono font-bold mb-4 text-center text-blue-600">
          /POWERFUL FEATURES
        </h2>
        <p className="text-center text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Purpose-built tools to revolutionize your dispatch operations and deliver exceptional service
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Intelligent Email Processing"
            description="Automatically categorize, prioritize and route incoming emails with 98% accuracy, reducing inbox overwhelm and ensuring critical messages get attention first."
            icon={Zap}
          />
          <FeatureCard
            title="Smart Response Generation"
            description="Generate context-aware responses that match your company voice and adapt to each customer's needs, reducing response time by up to 75%."
            icon={Server}
          />
          <FeatureCard
            title="Real-time Team Collaboration"
            description="Seamlessly hand off complex cases, share knowledge, and maintain visibility across your entire dispatch operation, eliminating information silos."
            icon={Users}
          />
          <FeatureCard
            title="Custom Workflow Automation"
            description="Create tailored automation rules that adapt to your unique business needs without requiring technical expertise or developer resources."
            icon={Database}
          />
          <FeatureCard
            title="Performance Analytics"
            description="Track key metrics like response time, resolution rate, and customer satisfaction with intuitive dashboards that highlight opportunities for improvement."
            icon={Clock}
          />
          <FeatureCard
            title="Enterprise-grade Security"
            description="Rest easy with SOC 2 compliance, end-to-end encryption, and role-based access controls that keep your customer data safe and compliant."
            icon={Shield}
          />
        </div>
      </div>
    </section>
  );
};
