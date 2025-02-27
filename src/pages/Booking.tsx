
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Car, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";

type Vehicle = {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  hourly_rate: number;
};

export default function Booking() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("");
  const [duration, setDuration] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
      } else {
        setUser(data.session.user);
      }
    };

    checkUser();
    fetchVehicles();
  }, [navigate]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_available", true);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching vehicles",
        description: error.message,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pickupDate || !pickupTime || !selectedVehicle || !duration || !pickupLocation || !dropoffLocation) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill all required fields",
      });
      return;
    }
    
    setLoading(true);
    
    // Combine date and time
    const [hours, minutes] = pickupTime.split(":").map(Number);
    const pickupDateTime = new Date(pickupDate);
    pickupDateTime.setHours(hours, minutes);
    
    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        vehicle_id: selectedVehicle,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        pickup_time: pickupDateTime.toISOString(),
        estimated_duration: parseInt(duration),
        special_requests: specialRequests,
        status: "pending",
      });
      
      if (error) throw error;
      
      toast({
        title: "Booking successful",
        description: "Your booking request has been submitted",
      });
      
      // Reset form
      setSelectedVehicle("");
      setPickupLocation("");
      setDropoffLocation("");
      setPickupDate(undefined);
      setPickupTime("");
      setDuration("");
      setSpecialRequests("");
      
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating booking",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/30">
      <Navbar />
      <div className="container max-w-4xl pt-32 pb-16 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Car className="h-6 w-6 text-blue-600 mr-2" />
              <CardTitle className="text-2xl font-mono text-blue-600">BOOK YOUR RIDE</CardTitle>
            </div>
            <CardDescription>
              Fill out the form below to request your luxury transportation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Type</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model} (${vehicle.hourly_rate}/hr)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <Input
                    id="pickup"
                    placeholder="Enter address"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dropoff">Dropoff Location</Label>
                  <Input
                    id="dropoff"
                    placeholder="Enter address"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Pickup Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Pickup Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Estimated Duration (minutes)</span>
                    </div>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g. 120"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests</Label>
                <Textarea
                  id="requests"
                  placeholder="Any special accommodations or preferences"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Request Booking"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
