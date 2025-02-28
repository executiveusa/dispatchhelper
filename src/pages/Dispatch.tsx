
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import LoadingSpinnerIcon from "@/components/LoadingSpinnerIcon";

// Define types that match our database schema
type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

type DispatchRequest = {
  id: string;
  created_at: string;
  status: BookingStatus;
  client_name: string;
  client_phone: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: string;
  notes: string;
  vehicle_id?: string;
  driver_id?: string;
};

type Driver = {
  id: string;
  name: string;
  phone: string;
  status: "available" | "busy" | "offline";
  current_location?: string;
};

type Booking = {
  id: string;
  created_at: string;
  user_id: string;
  vehicle_id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: string;
  special_requests: string | null;
  status: BookingStatus;
  updated_at: string;
  estimated_duration: number;
  driver_id?: string;
};

export default function Dispatch() {
  const [requests, setRequests] = useState<DispatchRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DispatchRequest | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
      }
    };

    checkUser();
    fetchDispatchRequests();
    fetchDrivers();
  }, [navigate]);

  const fetchDispatchRequests = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch from your actual bookings table
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("pickup_time", { ascending: true });

      if (error) throw error;
      
      // Transform bookings to dispatch requests format
      const dispatchRequests: DispatchRequest[] = (data || []).map((booking: Booking) => ({
        id: booking.id,
        created_at: booking.created_at,
        status: booking.status,
        client_name: "Client", // Default value since we don't have user details in the booking
        client_phone: "N/A", // Default value
        pickup_location: booking.pickup_location,
        dropoff_location: booking.dropoff_location,
        pickup_time: booking.pickup_time,
        notes: booking.special_requests || "",
        vehicle_id: booking.vehicle_id,
        driver_id: booking.driver_id
      }));
      
      setRequests(dispatchRequests);
    } catch (error: any) {
      console.error("Error fetching dispatch requests:", error);
      uiToast({
        variant: "destructive",
        title: "Failed to load dispatch requests",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      // In a real implementation, you'd fetch drivers from your database
      // Simulating data for now
      const dummyDrivers: Driver[] = [
        { id: "1", name: "John Smith", phone: "305-555-1234", status: "available", current_location: "Miami Beach" },
        { id: "2", name: "Maria Garcia", phone: "786-555-5678", status: "busy", current_location: "Downtown Miami" },
        { id: "3", name: "Robert Johnson", phone: "954-555-9012", status: "available", current_location: "Fort Lauderdale" },
        { id: "4", name: "Lisa Chen", phone: "561-555-3456", status: "offline", current_location: "West Palm Beach" },
      ];
      setDrivers(dummyDrivers);
    } catch (error: any) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleSelectRequest = (request: DispatchRequest) => {
    setSelectedRequest(request);
    setSelectedDriver(request.driver_id || "");
  };

  const handleAssignDriver = async () => {
    if (!selectedRequest || !selectedDriver) {
      toast("Please select both a request and a driver", {
        description: "Both fields are required to make an assignment",
      });
      return;
    }

    try {
      setAssigningDriver(true);
      
      // Update the booking with the assigned driver
      const { error } = await supabase
        .from("bookings")
        .update({ 
          driver_id: selectedDriver,
          status: "confirmed" // Using "confirmed" instead of "assigned" to match our database schema
        })
        .eq("id", selectedRequest.id);
      
      if (error) throw error;
      
      // Show success message
      toast("Driver assigned successfully", {
        description: `Driver has been assigned to the booking request.`,
      });
      
      // Refresh the dispatch requests
      fetchDispatchRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      console.error("Error assigning driver:", error);
      toast("Failed to assign driver", {
        description: error.message,
      });
    } finally {
      setAssigningDriver(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-200 text-yellow-800";
      case "confirmed": return "bg-blue-200 text-blue-800"; // Changed from "assigned" to "confirmed"
      case "in_progress": return "bg-purple-200 text-purple-800";
      case "completed": return "bg-green-200 text-green-800";
      case "cancelled": return "bg-red-200 text-red-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-200 text-green-800";
      case "busy": return "bg-orange-200 text-orange-800";
      case "offline": return "bg-gray-200 text-gray-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-blue-50/30">
      <Navbar />
      <div className="container pt-28 pb-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-600 font-mono">DISPATCH HELPER</h1>
          <p className="text-gray-600 mt-2">AI-Powered Dispatch System for Luxury Transportation</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch Requests List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Dispatch Requests</span>
                <Badge variant="outline" className="ml-2">{requests.length}</Badge>
              </CardTitle>
              <CardDescription>View and manage all transportation requests</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinnerIcon />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No dispatch requests found
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div 
                      key={request.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-blue-50 ${selectedRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => handleSelectRequest(request)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{request.client_name}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Pickup:</span> {request.pickup_location}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Dropoff:</span> {request.dropoff_location}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">Time:</span> {formatDate(request.pickup_time)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver Assignment Panel */}
          <div className="space-y-6">
            {/* Selected Request Details */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>Information about the selected request</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRequest ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Client</Label>
                      <div className="text-sm font-medium mt-1">{selectedRequest.client_name}</div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <div className="text-sm font-medium mt-1">{selectedRequest.client_phone}</div>
                    </div>
                    <div>
                      <Label>Pickup</Label>
                      <div className="text-sm font-medium mt-1">{selectedRequest.pickup_location}</div>
                    </div>
                    <div>
                      <Label>Dropoff</Label>
                      <div className="text-sm font-medium mt-1">{selectedRequest.dropoff_location}</div>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <div className="text-sm font-medium mt-1">{formatDate(selectedRequest.pickup_time)}</div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <div className="text-sm font-medium mt-1">{selectedRequest.notes || "No special notes"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Select a request to view details
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Driver Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Assign Driver</CardTitle>
                <CardDescription>Select a driver for the request</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRequest ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="driver">Select Driver</Label>
                      <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              <div className="flex items-center">
                                <span>{driver.name}</span>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getDriverStatusColor(driver.status)}`}>
                                  {driver.status}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={handleAssignDriver}
                      disabled={assigningDriver || !selectedDriver}
                      className="w-full bg-blue-600"
                    >
                      {assigningDriver ? "Assigning..." : "Assign Driver"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Select a request to assign a driver
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Available Drivers */}
            <Card>
              <CardHeader>
                <CardTitle>Available Drivers</CardTitle>
                <CardDescription>Drivers and their current status</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                <div className="space-y-3">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-xs text-gray-500">{driver.current_location}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getDriverStatusColor(driver.status)}`}>
                        {driver.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
