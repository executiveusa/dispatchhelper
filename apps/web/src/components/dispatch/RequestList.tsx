
import React, { useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinnerIcon from "@/components/LoadingSpinnerIcon";
import { DispatchRequest, getStatusColor, formatDate } from "./types";
import { FixedSizeList as List } from "react-window";
import { useWindowSize } from "@/hooks/useWindowSize";

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
  const { width } = useWindowSize();
  const listRef = useRef<List>(null);
  
  // Find the index of the selected request to scroll to it
  const selectedIndex = selectedRequestId 
    ? requests.findIndex(r => r.id === selectedRequestId)
    : -1;
    
  // Scroll to the selected item when it changes
  useEffect(() => {
    if (selectedIndex > -1 && listRef.current) {
      listRef.current.scrollToItem(selectedIndex, "smart");
    }
  }, [selectedIndex]);

  // Calculate list height based on container constraints
  const listHeight = 550; // Maximum height
  const itemHeight = 140; // Estimated height of each item
  
  // Render each request item
  const RequestItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const request = requests[index];
    return (
      <div 
        style={style}
        className={`p-4 mx-2 my-2 border rounded-lg cursor-pointer transition-colors hover:bg-blue-50 ${selectedRequestId === request.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
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
    );
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Dispatch Requests</span>
          <Badge variant="outline" className="ml-2">{requests.length}</Badge>
        </CardTitle>
        <CardDescription>View and manage all transportation requests</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinnerIcon />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No dispatch requests found
          </div>
        ) : (
          <List
            ref={listRef}
            height={listHeight}
            width="100%"
            itemCount={requests.length}
            itemSize={itemHeight}
            className="scrollbar-thin scrollbar-thumb-blue-300"
          >
            {RequestItem}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestList;
