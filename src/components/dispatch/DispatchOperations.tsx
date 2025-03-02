
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { DispatchRequest, Booking } from "./types";
import { useDriverStatus } from "@/hooks/useDriverStatus";

export const useDispatchOperations = () => {
  const [requests, setRequests] = useState<DispatchRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DispatchRequest | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  // Use our new custom hook for driver management
  const { drivers, isLoading: loadingDrivers, fetchDrivers } = useDriverStatus();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
      }
    };

    checkUser();
    fetchDispatchRequests();
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
      const dispatchRequests: DispatchRequest[] = (data || []).map((booking: any) => ({
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

  return {
    requests,
    drivers,
    selectedRequest,
    selectedDriver,
    loading: loading || loadingDrivers,
    assigningDriver,
    setSelectedDriver,
    handleSelectRequest,
    handleAssignDriver
  };
};
