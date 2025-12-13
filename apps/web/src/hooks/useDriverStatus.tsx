
import { useState, useEffect, useCallback } from "react";
import { Driver } from "@/components/dispatch/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseDriverStatusOptions {
  initialRefresh?: boolean;
}

export const useDriverStatus = (options: UseDriverStatusOptions = { initialRefresh: true }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you'd fetch from the drivers table
      // For now, we'll use dummy data as in the original implementation
      const dummyDrivers: Driver[] = [
        { id: "1", name: "John Smith", phone: "305-555-1234", status: "available", current_location: "Miami Beach" },
        { id: "2", name: "Maria Garcia", phone: "786-555-5678", status: "busy", current_location: "Downtown Miami" },
        { id: "3", name: "Robert Johnson", phone: "954-555-9012", status: "available", current_location: "Fort Lauderdale" },
        { id: "4", name: "Lisa Chen", phone: "561-555-3456", status: "offline", current_location: "West Palm Beach" },
      ];

      // Small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setDrivers(dummyDrivers);
    } catch (err: any) {
      setError(err.message || "Failed to fetch drivers");
      toast("Error fetching drivers", {
        description: err.message || "Please try again later",
      });
      console.error("Error fetching drivers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDriverStatus = useCallback(async (driverId: string, newStatus: "available" | "busy" | "offline") => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you'd update the driver status in your database
      // For now, we'll just update the local state
      
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.id === driverId ? { ...driver, status: newStatus } : driver
        )
      );
      
      toast("Driver status updated", {
        description: `Driver status has been changed to ${newStatus}`,
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update driver status");
      toast("Error updating driver status", {
        description: err.message || "Please try again later",
      });
      console.error("Error updating driver status:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAvailableDrivers = useCallback(() => {
    return drivers.filter(driver => driver.status === "available");
  }, [drivers]);

  const getDriverById = useCallback((driverId: string) => {
    return drivers.find(driver => driver.id === driverId) || null;
  }, [drivers]);

  const getDriversByStatus = useCallback((status: "available" | "busy" | "offline") => {
    return drivers.filter(driver => driver.status === status);
  }, [drivers]);

  // Initial fetch on component mount if initialRefresh is true
  useEffect(() => {
    if (options.initialRefresh) {
      fetchDrivers();
    }
  }, [fetchDrivers, options.initialRefresh]);

  return {
    drivers,
    isLoading,
    error,
    fetchDrivers,
    updateDriverStatus,
    getAvailableDrivers,
    getDriverById,
    getDriversByStatus
  };
};
