/**
 * Spatchy AI Command Center
 * 
 * Main dispatch operating system dashboard for boutique, female-led dispatch operations.
 * Features:
 * - Overview Health Strip: Today's metrics
 * - Live Lane Map: Conceptual lane visualization
 * - Active Loads Board: Kanban-style load management
 * - Driver Wellness & Capacity: Driver status and availability
 * - Problem Feed: Issues requiring attention
 * - AI Copilot Panel: Context-aware AI assistant
 */

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { OverviewHealthStrip } from '@/components/command-center/OverviewHealthStrip';
import { LoadsBoard } from '@/components/command-center/LoadsBoard';
import { DriverPanel } from '@/components/command-center/DriverPanel';
import { ProblemFeed } from '@/components/command-center/ProblemFeed';
import { AICopilotPanel } from '@/components/command-center/AICopilotPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CommandCenter() {
  const { user, profile, loading } = useAuth();
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spatchy-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spatchy-coral" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Only allow admin and dispatcher roles
  const allowedRoles = ['admin', 'dispatcher', 'owner'];
  if (!allowedRoles.includes(profile?.role || '')) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-spatchy-dark">
      <Navbar />
      
      <div className="pt-20 px-4 pb-8">
        {/* Header */}
        <div className="container mx-auto mb-6">
          <h1 className="billboard-title text-spatchy-coral">Command Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-native dispatch operating system
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="container mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Content (3/4 width on xl screens) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Overview Health Strip */}
            <OverviewHealthStrip />

            {/* Tabs for Main Views */}
            <Tabs defaultValue="loads" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="loads">Loads</TabsTrigger>
                <TabsTrigger value="drivers">Drivers</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
              </TabsList>
              
              <TabsContent value="loads" className="mt-6">
                <LoadsBoard 
                  selectedLoadId={selectedLoadId}
                  onSelectLoad={setSelectedLoadId}
                />
              </TabsContent>
              
              <TabsContent value="drivers" className="mt-6">
                <DriverPanel />
              </TabsContent>
              
              <TabsContent value="problems" className="mt-6">
                <ProblemFeed />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - AI Copilot (1/4 width on xl screens) */}
          <div className="xl:col-span-1">
            <AICopilotPanel 
              contextLoadId={selectedLoadId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
