
import React, { useState } from "react";
import { Code, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AISection = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello, I'm your personal AI assistant. How may I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: "user" as const,
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: input, userId: "demo-user" },
      });
      
      if (error) throw error;
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: data.reply || "Sorry, I couldn't process that request.",
        },
      ]);
    } catch (error) {
      console.error("Error calling AI function:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-gray-100 rounded-lg p-6 shadow-lg h-[400px] flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Code className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-sm text-gray-500">Always online</p>
                </div>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`${
                      message.role === "user" 
                        ? "bg-blue-100 p-3 rounded-lg rounded-tr-none shadow-sm ml-auto max-w-[80%]" 
                        : "bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%]"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm flex items-center space-x-2 max-w-[80%]">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="mt-auto flex">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your AI assistant..." 
                  className="flex-1 p-2 border rounded-l-lg outline-none focus:ring-2 focus:ring-blue-300" 
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded-r-lg flex items-center justify-center disabled:opacity-50"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-mono font-bold mb-6 text-blue-600">/INTELLIGENT WORKFLOW</h2>
            <p className="text-lg mb-6">
              Our AI assistant understands your business context, learns from your team's patterns, and helps automate complex workflows with natural language commands.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>Natural language processing</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>Learns your business context</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>Creates automated workflows</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>Provides insights and recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
