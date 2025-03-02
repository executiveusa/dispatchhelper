
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  is_from_user: boolean;
  user_email?: string;
}

export const AdminDashboard = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatMessages();
  }, []);

  const fetchChatMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, profiles:user_id(email)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include user_email from the joined profiles table
      const transformedData = data.map((message: any) => ({
        ...message,
        user_email: message.profiles?.email || 'Unknown User',
      }));

      setMessages(transformedData);
    } catch (error: any) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Chat Messages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Chat Messages</CardTitle>
              <CardDescription>View all chat interactions between users and the AI</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p>No chat messages found.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{message.user_email}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${message.is_from_user ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {message.is_from_user ? 'User' : 'AI'}
                        </span>
                      </div>
                      <p className="mt-2">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>View usage statistics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics dashboard will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
