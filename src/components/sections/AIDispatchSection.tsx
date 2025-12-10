
import React, { useState } from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AIDispatchSection = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section className="py-16 bg-slate-900 relative overflow-hidden" id="ai-dispatch">
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Command bar */}
        <div className="bg-slate-950/80 flex flex-col md:flex-row rounded-lg border border-blue-500/30 p-4 md:p-6 items-center justify-between mb-12 backdrop-blur-sm">
          <div className="flex items-center gap-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 flex items-center justify-center border border-blue-400 rounded bg-blue-600/20">
              <span className="text-blue-400 font-mono text-xs font-bold">07</span>
            </div>
            <div className="font-medium text-white font-mono tracking-wide">MISSION CONTROL</div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4 md:mb-0">
            <Link to="/" className="w-fit h-fit rounded flex items-center justify-center bg-blue-600/20 border border-blue-400 px-3 py-2">
              <span className="font-medium text-blue-300 font-mono text-sm">HQ</span>
            </Link>
            <a href="#team" className="px-3 py-2">
              <span className="text-gray-400 font-medium font-mono text-sm hover:text-blue-300 transition-colors">Intel</span>
            </a>
            <a href="#features" className="px-3 py-2">
              <span className="text-gray-400 font-medium font-mono text-sm hover:text-blue-300 transition-colors">Systems</span>
            </a>
            <a href="#community" className="px-3 py-2">
              <span className="text-gray-400 font-medium font-mono text-sm hover:text-blue-300 transition-colors">Agents</span>
            </a>
            <div className="px-3 py-2 cursor-pointer" onClick={() => setShowDemo(true)}>
              <span className="text-gray-400 font-medium font-mono text-sm hover:text-blue-300 transition-colors">Operations</span>
            </div>
            <Link to="/pricing" className="px-3 py-2">
              <span className="text-gray-400 font-medium font-mono text-sm hover:text-blue-300 transition-colors">Clearance</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/auth" className="font-medium text-gray-300 font-mono text-sm hover:text-blue-300">ACCESS</Link>
            <Link to="/auth">
              <Button variant="outline" className="gap-1 rounded border-blue-400 text-blue-300 hover:bg-blue-600/20">
                <span className="font-mono text-sm">DEPLOY</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-400 rounded-md backdrop-blur-sm mb-6">
            <span className="text-blue-300 font-mono text-sm tracking-widest">[ LIVE OPERATIONS FEED ]</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white font-mono">
            INTELLIGENCE DISPATCH
            <br />
            <span className="text-blue-400">IN ACTION</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Neural network processes mission intent, prioritizes threat levels, and learns from field operations. Real-time autonomous decision making.
          </p>
          <Button 
            onClick={() => setShowDemo(true)}
            className="bg-blue-600 hover:bg-blue-700 border border-blue-400 gap-2 rounded shadow-lg font-mono"
          >
            <PlayCircle className="w-5 h-5 text-white" />
            <span className="text-lg font-medium text-white">REVIEW MISSION FOOTAGE</span>
          </Button>
        </div>
        
        {showDemo && (
          <div className="flex justify-center mt-10">
            <div className="border-2 border-blue-500/50 rounded-lg overflow-hidden shadow-2xl">
              <iframe
                width="800"
                height="450"
                className="rounded-lg"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with your actual video ID
                title="Mission Operations Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
        
        {/* Vehicle showcase */}
        <div className="mt-16 flex justify-center items-center gap-12 flex-wrap">
          <div className="text-center">
            <img src="/photos/vehicles/spy-vehicle-1.svg" alt="Unit Alpha" className="w-80 h-60 object-contain mb-4" />
          </div>
          <div className="text-center">
            <img src="/photos/vehicles/spy-vehicle-2.svg" alt="Unit Bravo" className="w-80 h-60 object-contain mb-4" />
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/ai-dispatch">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded border border-blue-400 font-mono tracking-wide">
              REQUEST OPERATIONAL BRIEFING
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AIDispatchSection;
