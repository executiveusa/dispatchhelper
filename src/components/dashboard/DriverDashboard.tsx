/**
 * Driver Dashboard
 *
 * View for drivers to see their assignments and update status
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Clock, Navigation } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDrivers } from '@/hooks/useDrivers';
import { useAssignmentsByDriver } from '@/hooks/useAssignments';

const DriverDashboard = () => {
  const { user } = useAuth();

  // Find driver record for current user
  const { data: drivers = [] } = useDrivers();
  const currentDriver = drivers.find((d) => d.user_id === user?.id);

  const { data: assignments = [] } = useAssignmentsByDriver(currentDriver?.id || '');

  const activeAssignment = assignments.find(
    (a: any) => a.status === 'accepted' || a.status === 'in_progress'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {currentDriver?.name || 'Driver'}
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {currentDriver?.status === 'available' && 'Available'}
                {currentDriver?.status === 'assigned' && 'Assigned'}
                {currentDriver?.status === 'on_route' && 'On Route'}
                {currentDriver?.status === 'off_duty' && 'Off Duty'}
              </div>
              {currentDriver?.current_location && (
                <div className="text-sm text-gray-600 mt-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {currentDriver.current_location}
                </div>
              )}
            </div>
            <Badge
              variant={
                currentDriver?.status === 'available'
                  ? 'default'
                  : currentDriver?.status === 'off_duty'
                  ? 'secondary'
                  : 'outline'
              }
              className="text-lg px-4 py-2"
            >
              {currentDriver?.status || 'Unknown'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Assignment */}
      {activeAssignment ? (
        <Card>
          <CardHeader>
            <CardTitle>Active Assignment</CardTitle>
            <CardDescription>Your current delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <div className="font-medium">Pickup Location</div>
                  <div className="text-gray-600">
                    {activeAssignment.request?.pickup_location}
                  </div>
                  {activeAssignment.request?.pickup_datetime && (
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(
                        activeAssignment.request.pickup_datetime
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <div className="font-medium">Dropoff Location</div>
                  <div className="text-gray-600">
                    {activeAssignment.request?.dropoff_location}
                  </div>
                  {activeAssignment.request?.dropoff_datetime && (
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(
                        activeAssignment.request.dropoff_datetime
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {activeAssignment.request?.cargo_type && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">Cargo</div>
                    <div className="text-gray-600">
                      {activeAssignment.request.cargo_type}
                      {activeAssignment.request.weight &&
                        ` • ${activeAssignment.request.weight} ${activeAssignment.request.weight_unit}`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Start Delivery
              </Button>
              <Button variant="outline" className="flex-1">
                Contact Dispatcher
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Active Assignment</h3>
            <p className="text-gray-600 mt-1">
              You don't have any active deliveries at the moment
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignment History */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
          <CardDescription>Your recent deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assignments yet</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment: any) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {assignment.request?.pickup_location} →{' '}
                      {assignment.request?.dropoff_location}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline">{assignment.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;
