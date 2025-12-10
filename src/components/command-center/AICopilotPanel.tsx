/**
 * AI Copilot Panel
 * 
 * Context-aware AI assistant panel that helps with:
 * - Load management suggestions
 * - Driver assignment recommendations
 * - Message drafting (broker/driver communication)
 * - Problem resolution guidance
 * - Performance summaries
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, Zap, MessageSquare, TrendingUp } from 'lucide-react';

interface AICopilotPanelProps {
  contextLoadId?: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { label: 'Fill empty trucks', icon: Zap, prompt: 'What trucks need loads for tomorrow?' },
  { label: 'Draft broker update', icon: MessageSquare, prompt: 'Draft an update for brokers about today\'s deliveries' },
  { label: 'Weekly summary', icon: TrendingUp, prompt: 'Summarize this week\'s performance' },
];

export function AICopilotPanel({ contextLoadId }: AICopilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI dispatch copilot. I can help you manage loads, communicate with drivers and brokers, and optimize your operations. What can I help with today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call the ai-dispatch edge function)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want to: "${input}". This is a demo response. In production, I would analyze your dispatch data and provide specific recommendations, draft messages, or suggest actions based on your current operations.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col sticky top-24">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-spatchy-coral to-spatchy-slate flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-base font-semibold">AI Copilot</div>
            {contextLoadId && (
              <Badge variant="outline" className="text-xs mt-1">
                Load context active
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Quick Prompts */}
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-900/50">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt.label}
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() => handleQuickPrompt(prompt.prompt)}
                disabled={isLoading}
              >
                <prompt.icon className="h-3 w-3 mr-1" />
                {prompt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-spatchy-coral text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-spatchy-coral" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-spatchy-coral hover:bg-spatchy-coral/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Powered by AI • Your data stays private
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
