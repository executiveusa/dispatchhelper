
import React, { useState } from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AIDispatchSection = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-[#FBFAFA] flex flex-col md:flex-row rounded-3xl border border-[#CDD0D5] p-4 md:p-6 items-center justify-between mb-12">
          <div className="flex items-center gap-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8">
              <img alt="AI Dispatch Logo" className="w-full h-full" src="/placeholder.svg" />
            </div>
            <div className="font-medium">AI Dispatch System</div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4 md:mb-0">
            <div className="w-fit h-fit rounded-2xl flex items-center justify-center bg-white border border-[#CDD0D5] px-3 py-2">
              <span className="font-medium text-[#984422]">Home</span>
            </div>
            <div className="px-3 py-2">
              <span className="text-[#525866] font-medium">About Us</span>
            </div>
            <div className="px-3 py-2">
              <span className="text-[#525866] font-medium">Features</span>
            </div>
            <div className="px-3 py-2">
              <span className="text-[#525866] font-medium">Use Cases</span>
            </div>
            <div className="px-3 py-2 cursor-pointer" onClick={() => setShowDemo(true)}>
              <span className="text-[#525866] font-medium">Demo</span>
            </div>
            <div className="px-3 py-2">
              <span className="text-[#525866] font-medium">Pricing</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="font-medium">Login</div>
            <Button variant="outline" className="gap-1 rounded-xl">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            AI-Powered Dispatch Automation
          </h1>
          <p className="text-xl text-[#525866] mb-8 max-w-2xl mx-auto">
            Reduce workload, automate responses, and streamline dispatch operations with AI-driven solutions.
          </p>
          <Button 
            onClick={() => setShowDemo(true)}
            className="bg-[#984422] hover:bg-[#873d1d] border-[#6A270B] gap-2 rounded-xl shadow-md"
          >
            <PlayCircle className="w-5 h-5 text-white" />
            <span className="text-lg font-medium text-white">Watch Demo</span>
          </Button>
        </div>
        
        {showDemo && (
          <div className="flex justify-center mt-10">
            <iframe
              width="800"
              height="450"
              className="rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with your actual video ID
              title="AI Dispatch System Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link to="/ai-dispatch">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              Try AI Dispatch Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AIDispatchSection;
