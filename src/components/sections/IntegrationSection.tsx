
import { Code } from "lucide-react";

export const IntegrationSection = () => {
  return (
    <section id="integrate" className="py-24 bg-white">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-mono font-bold mb-6 text-blue-600">/AI POWERED</h2>
            <p className="text-lg text-blue-600/80 mb-8">
              Our proprietary AI system doesn't just automate—it learns your business. It adapts to your workflows, anticipates customer needs, and improves with every interaction.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-blue-600">Adaptive response suggestions based on your history</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-blue-600">Smart dispatch prioritization by urgency and value</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-blue-600">Predictive analytics for resource allocation</p>
              </div>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
              alt="Team using AI dispatch system"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
