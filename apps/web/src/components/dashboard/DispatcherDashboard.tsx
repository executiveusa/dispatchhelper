/**
 * Dispatcher Dashboard
 *
 * Main view for dispatchers to manage requests, drivers, and assignments
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useRequests, usePendingRequests } from '@/hooks/useRequests';
import { useDrivers, useAvailableDrivers } from '@/hooks/useDrivers';
import { useAssignments } from '@/hooks/useAssignments';
import { useRealtimeRequests, useRealtimeDrivers, useRealtimeAssignments } from '@/hooks/useRealtime';
import AIChat from '../dispatch/AIChat';

const DispatcherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: allRequests = [] } = useRequests();
  const { data: pendingRequests = [] } = usePendingRequests();
  const { data: allDrivers = [] } = useDrivers();
  const { data: availableDrivers = [] } = useAvailableDrivers();
  const { data: assignments = [] } = useAssignments();

  // Real-time subscriptions
  useRealtimeRequests();
  useRealtimeDrivers();
  useRealtimeAssignments();

  // Calculate stats
  const stats = {
    totalRequests: allRequests.length,
    pendingRequests: pendingRequests.length,
    activeDrivers: allDrivers.filter((d) => d.status !== 'inactive').length,
    availableDrivers: availableDrivers.length,
    completedToday: allRequests.filter(
      (r) =>
        r.status === 'delivered' &&
        new Date(r.updated_at).toDateString() === new Date().toDateString()
    ).length,
    inTransit: allRequests.filter((r) => r.status === 'in_transit').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dispatcher Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage loads, drivers, and dispatch operations
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.pendingRequests} pending assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableDrivers}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.activeDrivers} total active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-gray-600 mt-1">Active deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-gray-600 mt-1">Delivered successfully</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {stats.pendingRequests > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Loads awaiting driver assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 5).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {request.pickup_location} → {request.dropoff_location}
                          </div>
                          <div className="text-sm text-gray-600">
                            {request.cargo_type || 'General cargo'}
                            {request.weight && ` • ${request.weight} ${request.weight_unit}`}
                          </div>
                        </div>
                        <Badge
                          variant={
                            request.priority === 'urgent'
                              ? 'destructive'
                              : request.priority === 'high'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {request.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Drivers */}
            <Card>
              <CardHeader>
                <CardTitle>Available Drivers</CardTitle>
                <CardDescription>
                  Drivers ready for assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableDrivers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No available drivers
                  </p>
                ) : (
                  <div className="space-y-3">
                    {availableDrivers.slice(0, 5).map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-gray-600">
                            {driver.truck_number || 'No truck assigned'}
                            {driver.current_location && ` • ${driver.current_location}`}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Available
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest dispatch operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.slice(0, 5).map((assignment: any) => (
                  <div key={assignment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {assignment.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : assignment.status === 'in_progress' ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {assignment.driver?.name} assigned to load
                      </div>
                      <div className="text-sm text-gray-600">
                        {assignment.request?.pickup_location} →{' '}
                        {assignment.request?.dropoff_location}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(assignment.assigned_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline">{assignment.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>All Requests</CardTitle>
              <CardDescription>Manage dispatch requests and loads</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Full request management interface coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Driver Management</CardTitle>
              <CardDescription>View and manage driver fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Full driver management interface coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <AIChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatcherDashboard;
