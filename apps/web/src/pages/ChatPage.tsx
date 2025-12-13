
import React from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ChatbotComponent from "@/components/ChatbotComponent";
import AdminDashboard from "@/components/admin/AdminDashboard";

const ChatPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-28 py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Chat with our AI Assistant</h2>
            <p className="text-muted-foreground mb-6">
              Ask questions about your account, get help with our platform, or learn about new features.
            </p>
            <ChatbotComponent />
          </div>
          
          {isAdmin && (
            <div>
              <AdminDashboard />
            </div>
          )}
          
          {!isAdmin && (
            <div className="bg-muted/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">✓</span>
                  <span>Ask questions about your account</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">✓</span>
                  <span>Get help with platform features</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">✓</span>
                  <span>Request support for specific issues</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">✓</span>
                  <span>Voice commands for hands-free operation</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2">✓</span>
                  <span>Get answers to common questions</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
