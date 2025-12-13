
import React from "react";
import Navbar from "@/components/Navbar";
import Features from "@/components/dispatch/AiDispatchFeatures";
import { UploadSection } from "@/components/dispatch/UploadSection";
import EnhancedChatbot from "@/components/dispatch/EnhancedChatbot";

const AiDispatch: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50/30">
      <Navbar />
      <div className="container pt-28 pb-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 font-mono">AI-POWERED DISPATCH AUTOMATION</h1>
          <p className="text-gray-600 mt-2">
            Streamline email handling, automate quote responses, and optimize your dispatch process with AI.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Features />
            <UploadSection />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-600">AI Dispatch Assistant</h2>
            <EnhancedChatbot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDispatch;
