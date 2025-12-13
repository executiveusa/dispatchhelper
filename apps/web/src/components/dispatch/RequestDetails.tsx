
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DispatchRequest, formatDate } from "./types";

interface RequestDetailsProps {
  selectedRequest: DispatchRequest | null;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ selectedRequest }) => {
  return (
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
  );
};

export default RequestDetails;
