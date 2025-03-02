
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinnerIcon from "@/components/LoadingSpinnerIcon";

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  role: string;
  created_at: string;
  email?: string;
}

const AdminDashboard: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchChatMessages = async () => {
    setIsLoading(true);
    try {
      // Use Supabase's RPC function to get the view data
      const { data, error } = await supabase
        .rpc('get_admin_chat_messages')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Type assertion to ensure the data matches our ChatMessage interface
      setMessages(data as ChatMessage[]);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      setError("Failed to load chat messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if the user is logged in (and presumably an admin)
    if (user) {
      fetchChatMessages();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel("admin_chat_messages")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "chat_messages" },
          (payload) => {
            // Refresh the messages when there's a change
            fetchChatMessages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const userMessages = messages.filter(
    (message) => message.role === "user"
  ).length;
  
  const assistantMessages = messages.filter(
    (message) => message.role === "assistant"
  ).length;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Messages</CardTitle>
            <CardDescription>All chat interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{messages.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>User Messages</CardTitle>
            <CardDescription>Messages from users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userMessages}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>AI Responses</CardTitle>
            <CardDescription>Messages from assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assistantMessages}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Messages</TabsTrigger>
          <TabsTrigger value="user">User Messages</TabsTrigger>
          <TabsTrigger value="assistant">AI Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="border rounded-md p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinnerIcon className="w-8 h-8" />
            </div>
          ) : error ? (
            <p className="text-destructive text-center py-4">{error}</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {message.role === "user" ? message.email || "User" : "AI Assistant"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1">{message.content}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">No messages found</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="user" className="border rounded-md p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinnerIcon className="w-8 h-8" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .filter((message) => message.role === "user")
                .map((message) => (
                  <div key={message.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{message.email || "User"}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                  </div>
                ))}
              {messages.filter((message) => message.role === "user").length === 0 && (
                <p className="text-center py-4 text-muted-foreground">No user messages found</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="assistant" className="border rounded-md p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinnerIcon className="w-8 h-8" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .filter((message) => message.role === "assistant")
                .map((message) => (
                  <div key={message.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">AI Assistant</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                  </div>
                ))}
              {messages.filter((message) => message.role === "assistant").length === 0 && (
                <p className="text-center py-4 text-muted-foreground">No AI responses found</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
