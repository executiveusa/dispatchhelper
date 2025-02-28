
import React from "react";
import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/dispatch/ChatInterface";

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-mono font-bold mb-8 text-blue-600">
          /AI ASSISTANT
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Chat with our AI-powered dispatch assistant for real-time help with bookings,
          driver inquiries, route optimization, and more.
        </p>
        <div className="max-w-3xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
