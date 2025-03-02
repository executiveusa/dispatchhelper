
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinnerIcon from "@/components/LoadingSpinnerIcon";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatbotComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your AI dispatch assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: input, userId: user?.id || "anonymous" },
      });
      
      if (error) throw error;
      
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply || "Sorry, I couldn't process that request.",
          timestamp: new Date(),
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

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        // Start recording logic would go here
        // This is a simplified implementation
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Speak now...",
        });
      } catch (error) {
        console.error("Error starting recording:", error);
        toast({
          title: "Error",
          description: "Could not start recording. Please check microphone permissions.",
          variant: "destructive",
        });
      }
    } else {
      setIsRecording(false);
      // Here we would process the recording and send it to the backend
      // This is a placeholder
      toast({
        title: "Recording stopped",
        description: "Processing your message...",
      });
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg shadow-sm bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-70 block mt-1">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
              <LoadingSpinnerIcon className="w-6 h-6" />
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || isRecording}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={toggleRecording}
          className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
        >
          {isRecording ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatbotComponent;
