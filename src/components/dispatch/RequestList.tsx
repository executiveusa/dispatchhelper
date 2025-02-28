
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinnerIcon from "@/components/LoadingSpinnerIcon";
import { DispatchRequest, getStatusColor, formatDate } from "./types";

interface RequestListProps {
  requests: DispatchRequest[];
  loading: boolean;
  selectedRequestId: string | null;
  onSelectRequest: (request: DispatchRequest) => void;
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  loading,
  selectedRequestId,
  onSelectRequest,
}) => {
  return (
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
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-blue-50 ${selectedRequestId === request.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => onSelectRequest(request)}
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
  );
};

export default RequestList;
