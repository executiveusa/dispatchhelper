
import { Code } from "lucide-react";

export const IntegrationSection = () => {
  return (
    <section id="integrate" className="py-24 bg-black relative overflow-hidden">
      {/* Tech background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-400 rounded-md backdrop-blur-sm mb-6">
              <span className="text-blue-300 font-mono text-sm tracking-widest">[ INTELLIGENCE CORE ]</span>
            </div>
            <h2 className="text-4xl font-mono font-bold mb-6 text-blue-400 tracking-wider">AI NEURAL NETWORK</h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Our classified intelligence system continuously learns mission protocols, adapts to operational patterns, and evolves with every field deployment. Neural processing exceeds human capabilities.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <p className="text-gray-300">Adaptive protocol suggestions based on mission history</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <p className="text-gray-300">Smart mission prioritization by threat level and value</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                <p className="text-gray-300">Predictive analytics for resource deployment</p>
              </div>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden border-2 border-blue-500/30 shadow-2xl">
            <img
              src="/photos/backgrounds/command-center.svg"
              alt="Intelligence Command Center"
              className="rounded-lg w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-blue-400 font-mono text-xs">
                <span>SYSTEM STATUS: OPERATIONAL</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
