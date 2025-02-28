
import React from "react";
import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/dispatch/ChatInterface";

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50/30">
      <Navbar />
      <div className="container mx-auto py-12 px-4 pt-28">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-mono font-bold text-blue-600">
            /AI DISPATCH ASSISTANT
          </h1>
          <p className="text-lg text-gray-700 mt-2">
            Chat with our AI-powered assistant for real-time help with bookings,
            driver inquiries, and route optimization.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
