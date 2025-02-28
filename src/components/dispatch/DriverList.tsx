
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Driver, getDriverStatusColor } from "./types";

interface DriverListProps {
  drivers: Driver[];
}

const DriverList: React.FC<DriverListProps> = ({ drivers }) => {
  return (
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
  );
};

export default DriverList;
