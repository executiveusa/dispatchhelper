
import React, { useState } from "react";
import { Code, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AISection = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Intelligence Officer online. Awaiting mission parameters. How may I assist with your operation?"
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
      
      if (error) {
        console.error("Error calling AI function:", error);
        throw error;
      }
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: data?.reply || "Sorry, I couldn't process that request.",
        },
      ]);
    } catch (error) {
      console.error("Error calling AI function:", error);
      
      // Add fallback response when the API call fails
      setMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: "I'm currently experiencing technical difficulties. Please try again later or contact support if this persists.",
        },
      ]);
      
      toast({
        title: "Communication Error",
        description: "Could not connect to the AI service. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Tech background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-slate-900/80 rounded-lg border border-blue-500/30 p-6 shadow-2xl h-[400px] flex flex-col backdrop-blur-sm">
              <div className="flex items-center mb-4 pb-4 border-b border-blue-500/30">
                <div className="w-12 h-12 rounded bg-blue-600/20 border border-blue-400 flex items-center justify-center text-white">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-white font-mono">INTELLIGENCE OFFICER</h3>
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    OPERATIONAL
                  </p>
                </div>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto mb-4 pr-2">
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`${
                      message.role === "user" 
                        ? "bg-blue-600/30 border border-blue-400/50 p-3 rounded rounded-tr-none shadow-sm ml-auto max-w-[80%] text-gray-200" 
                        : "bg-slate-800/80 border border-blue-500/20 p-3 rounded rounded-tl-none shadow-sm max-w-[80%] text-gray-300"
                    }`}
                  >
                    <div className="font-mono text-xs text-blue-400 mb-1">
                      {message.role === "user" ? "[COMMAND]" : "[INTEL]"}
                    </div>
                    {message.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-slate-800/80 border border-blue-500/20 p-3 rounded rounded-tl-none shadow-sm flex items-center space-x-2 max-w-[80%]">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="mt-auto flex">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter command..." 
                  className="flex-1 p-2 bg-slate-800 border border-blue-500/30 rounded-l text-gray-300 outline-none focus:ring-2 focus:ring-blue-400 font-mono placeholder-gray-500" 
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 border border-blue-400 text-white p-2 rounded-r flex items-center justify-center disabled:opacity-50 transition-colors"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-400 rounded-md backdrop-blur-sm mb-6">
              <span className="text-blue-300 font-mono text-sm tracking-widest">[ NEURAL INTERFACE ]</span>
            </div>
            <h2 className="text-4xl font-mono font-bold mb-6 text-blue-400 tracking-wider">INTELLIGENT PROTOCOL</h2>
            <p className="text-lg mb-6 text-gray-300 leading-relaxed">
              Intelligence system processes mission parameters, learns operational patterns, and automates complex field protocols through natural language commands.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded bg-blue-600/20 border border-blue-400 flex items-center justify-center mr-3">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                <span className="text-gray-300">Natural language command processing</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded bg-blue-600/20 border border-blue-400 flex items-center justify-center mr-3">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                <span className="text-gray-300">Learns mission context and parameters</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded bg-blue-600/20 border border-blue-400 flex items-center justify-center mr-3">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                <span className="text-gray-300">Creates autonomous operation workflows</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded bg-blue-600/20 border border-blue-400 flex items-center justify-center mr-3">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                <span className="text-gray-300">Strategic insights and tactical recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
