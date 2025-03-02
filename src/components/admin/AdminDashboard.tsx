
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingData {
  id: string;
  created_at: string;
  user_id: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  pickup_time: string;
}

export const AdminDashboard = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*, profiles:user_id(email)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include user_email from the joined profiles table
      const transformedData = data.map((booking: any) => ({
        ...booking,
        user_email: booking.profiles?.email || 'Unknown User',
      }));

      setBookings(transformedData);
    } catch (error: any) {
      console.error('Error fetching booking data:', error);
      toast.error('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>View all recent bookings from users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p>No bookings found.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{booking.user_email}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p>From: {booking.pickup_location}</p>
                        <p>To: {booking.dropoff_location}</p>
                        <p>Time: {new Date(booking.pickup_time).toLocaleString()}</p>
                      </div>
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
