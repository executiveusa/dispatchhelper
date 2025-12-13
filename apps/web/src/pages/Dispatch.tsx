
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RequestList from "@/components/dispatch/RequestList";
import RequestDetails from "@/components/dispatch/RequestDetails";
import DriverAssignment from "@/components/dispatch/DriverAssignment";
import DriverList from "@/components/dispatch/DriverList";
import { useDispatchOperations } from "@/components/dispatch/DispatchOperations";

export default function Dispatch() {
  const {
    requests,
    drivers,
    selectedRequest,
    selectedDriver,
    loading,
    assigningDriver,
    setSelectedDriver,
    handleSelectRequest,
    handleAssignDriver
  } = useDispatchOperations();

  return (
    <div className="min-h-screen bg-blue-50/30">
      <Navbar />
      <div className="container pt-28 pb-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-600 font-mono">MANAGEMENT DASHBOARD</h1>
          <p className="text-gray-600 mt-2">AI-Powered Management System</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request List */}
          <RequestList 
            requests={requests}
            loading={loading}
            selectedRequestId={selectedRequest?.id || null}
            onSelectRequest={handleSelectRequest}
          />

          {/* Assignment Panel */}
          <div className="space-y-6">
            {/* Selected Request Details */}
            <RequestDetails selectedRequest={selectedRequest} />
            
            {/* Assignment */}
            <DriverAssignment
              selectedRequest={selectedRequest}
              selectedDriver={selectedDriver}
              setSelectedDriver={setSelectedDriver}
              drivers={drivers}
              assigningDriver={assigningDriver}
              onAssignDriver={handleAssignDriver}
            />
            
            {/* Available Resources */}
            <DriverList drivers={drivers} />
          </div>
        </div>
      </div>
    </div>
  );
}
