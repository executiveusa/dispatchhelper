
import { Code } from "lucide-react";

export const IntegrationSection = () => {
  return (
    <section id="integrate" className="py-24 bg-white">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-mono font-bold mb-6 text-blue-600">/AI POWERED</h2>
            <p className="text-lg text-blue-600/80 mb-8">
              Our proprietary AI system learns your workflows and processes over time, anticipating your needs and automating repetitive tasks without any manual configuration.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-blue-600">Intelligent workflow suggestions</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-blue-600">Automated data analysis</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-blue-600">Real-time anomaly detection</p>
              </div>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952"
              alt="AI-powered analytics dashboard"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
