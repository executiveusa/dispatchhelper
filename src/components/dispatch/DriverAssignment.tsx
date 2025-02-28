
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Driver, DispatchRequest, getDriverStatusColor } from "./types";

interface DriverAssignmentProps {
  selectedRequest: DispatchRequest | null;
  selectedDriver: string;
  setSelectedDriver: (driverId: string) => void;
  drivers: Driver[];
  assigningDriver: boolean;
  onAssignDriver: () => void;
}

const DriverAssignment: React.FC<DriverAssignmentProps> = ({
  selectedRequest,
  selectedDriver,
  setSelectedDriver,
  drivers,
  assigningDriver,
  onAssignDriver,
}) => {
  return (
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
              onClick={onAssignDriver}
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
  );
};

export default DriverAssignment;
