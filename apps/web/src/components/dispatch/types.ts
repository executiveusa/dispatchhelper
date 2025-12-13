
// Define types that match our database schema
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type DispatchRequest = {
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

export type Driver = {
  id: string;
  name: string;
  phone: string;
  status: "available" | "busy" | "offline";
  current_location?: string;
};

export type Booking = {
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

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-200 text-yellow-800";
    case "confirmed": return "bg-blue-200 text-blue-800";
    case "in_progress": return "bg-purple-200 text-purple-800";
    case "completed": return "bg-green-200 text-green-800";
    case "cancelled": return "bg-red-200 text-red-800";
    default: return "bg-gray-200 text-gray-800";
  }
};

export const getDriverStatusColor = (status: string) => {
  switch (status) {
    case "available": return "bg-green-200 text-green-800";
    case "busy": return "bg-orange-200 text-orange-800";
    case "offline": return "bg-gray-200 text-gray-800";
    default: return "bg-gray-200 text-gray-800";
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};
