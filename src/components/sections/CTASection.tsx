
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Dramatic lighting effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`
        }} />
      </div>
      
      <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8 relative z-10">
        <div className="max-w-2xl md:mx-auto">
          <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-400 rounded-md backdrop-blur-sm mb-6">
            <span className="text-blue-300 font-mono text-sm tracking-widest">[ AUTHORIZATION REQUIRED ]</span>
          </div>
          <h3 className="text-white text-4xl font-semibold sm:text-5xl font-mono tracking-wide mb-6">
            READY TO DEPLOY?
          </h3>
          <p className="mt-3 text-gray-300 text-lg leading-relaxed">
            Join 200+ active units achieving 75% faster mission response and 40% improved operational efficiency with our intelligence dispatch protocol.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mt-10">
          <Link to="/auth">
            <Button 
              size="lg"
              className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all border border-blue-400 font-mono tracking-wide"
            >
              INITIATE 14-DAY PROTOCOL
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              size="lg"
              variant="outline" 
              className="w-full md:w-auto text-blue-300 border-blue-400 bg-transparent hover:bg-blue-950/50 backdrop-blur-sm font-mono tracking-wide"
            >
              VIEW CLEARANCE LEVELS
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-mono">
          <span className="text-blue-400">●</span> No authorization codes required. Terminate access anytime.
        </p>
      </div>
    </section>
  );
};
