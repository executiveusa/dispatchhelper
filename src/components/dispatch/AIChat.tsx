/**
 * AI Chat Component
 *
 * Enhanced chat interface integrated with Supabase AI edge function
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, User, Sparkles, Trash2 } from 'lucide-react';
import LoadingSpinnerIcon from '@/components/LoadingSpinnerIcon';
import { useAuth } from '@/context/AuthContext';
import { useMessages, useSendMessage, useAddMessage, useCreateSession } from '@/hooks/useAI';
import { useRealtimeMessages } from '@/hooks/useRealtime';

interface AIChatProps {
  sessionId?: string;
  tenantId?: string;
  onSessionCreated?: (sessionId: string) => void;
}

const AIChat: React.FC<AIChatProps> = ({ sessionId: initialSessionId, tenantId, onSessionCreated }) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: loadingMessages } = useMessages(sessionId || '');
  const sendMessageMutation = useSendMessage();
  const addMessageMutation = useAddMessage();
  const createSessionMutation = useCreateSession();

  // Real-time subscription
  useRealtimeMessages(sessionId || undefined);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create session if not provided
  useEffect(() => {
    if (!sessionId) {
      createSessionMutation.mutate(
        { title: 'New Dispatch Chat', tenantId },
        {
          onSuccess: (session) => {
            setSessionId(session.id);
            onSessionCreated?.(session.id);
          },
        }
      );
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');

    try {
      // Add user message to database
      await addMessageMutation.mutateAsync({
        sessionId,
        role: 'user',
        content: { text: messageContent },
      });

      // Send to AI
      await sendMessageMutation.mutateAsync({
        sessionId,
        message: messageContent,
        tenantId,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isLoading = sendMessageMutation.isPending || addMessageMutation.isPending;

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
            Spatchy AI Assistant
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto px-4 pb-0">
        {loadingMessages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinnerIcon />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-blue-50 rounded-lg px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Spatchy AI</span>
                  </div>
                  <div className="text-gray-700">
                    Hello! I'm Spatchy AI, your intelligent dispatch assistant. I can help you:
                    <ul className="list-disc ml-4 mt-2">
                      <li>Create new dispatch requests</li>
                      <li>Assign drivers to loads</li>
                      <li>Check driver availability</li>
                      <li>Update request statuses</li>
                    </ul>
                    <p className="mt-2">How can I assist you today?</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === 'user';
              const content =
                typeof message.content === 'string'
                  ? message.content
                  : message.content?.text || JSON.stringify(message.content);

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : message.role === 'system'
                        ? 'bg-gray-100 text-gray-600 italic'
                        : 'bg-blue-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isUser ? (
                        <>
                          <span className="font-medium">You</span>
                          <User className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Spatchy AI</span>
                        </>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{content}</div>
                    <div
                      className={`text-xs opacity-70 mt-1 text-right ${
                        isUser ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                    <span className="font-medium text-blue-900">Spatchy AI</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <LoadingSpinnerIcon />
                    <span className="text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 border-t">
        <div className="flex w-full items-center space-x-2 pt-4">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about dispatch operations..."
            className="flex-grow resize-none"
            rows={1}
            maxLength={500}
            disabled={!sessionId || isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim() || !sessionId}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
