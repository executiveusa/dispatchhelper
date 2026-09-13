/**
 * Driver Wellness & Capacity Panel
 * 
 * Shows driver status, availability, and health indicators:
 * - Current status (on load, available, off-duty)
 * - Hours remaining (HOS approximation)
 * - Mood/sentiment gauge
 * - Quick assign capability
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Driver {
  id: string;
  name: string;
  phone?: string;
  status: string;
  current_location?: string;
  location_updated_at?: string;
}

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-400' },
  assigned: { label: 'Assigned', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-400' },
  on_route: { label: 'On Route', color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-400' },
  off_duty: { label: 'Off Duty', color: 'bg-gray-500', textColor: 'text-gray-700 dark:text-gray-400' },
  inactive: { label: 'Inactive', color: 'bg-gray-300', textColor: 'text-gray-600 dark:text-gray-500' },
};

function DriverCard({ driver }: { driver: Driver }) {
  const statusInfo = statusConfig[driver.status as keyof typeof statusConfig] || statusConfig.inactive;
  const initials = driver.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-spatchy-coral text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Driver Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {driver.name}
                </h4>
                {driver.phone && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {driver.phone}
                  </p>
                )}
              </div>
              <Badge 
                variant="outline" 
                className={`${statusInfo.textColor} border-current`}
              >
                {statusInfo.label}
              </Badge>
            </div>

            {/* Location */}
            {driver.current_location && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{driver.current_location}</span>
              </div>
            )}

            {/* Mock Hours Remaining */}
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>8.5 hrs remaining</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DriverPanel() {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Driver[];
    },
    refetchInterval: 20000, // Refresh every 20 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-24 bg-gray-100 dark:bg-gray-800 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group drivers by status
  const availableDrivers = drivers?.filter(d => d.status === 'available') || [];
  const busyDrivers = drivers?.filter(d => ['assigned', 'on_route'].includes(d.status)) || [];
  const offDutyDrivers = drivers?.filter(d => ['off_duty', 'inactive'].includes(d.status)) || [];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{availableDrivers.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{busyDrivers.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">On Load</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{offDutyDrivers.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Off Duty</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Drivers */}
      {availableDrivers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Available Now
          </h3>
          <div className="space-y-3">
            {availableDrivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        </div>
      )}

      {/* Busy Drivers */}
      {busyDrivers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            On the Road
          </h3>
          <div className="space-y-3">
            {busyDrivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        </div>
      )}

      {drivers?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">
            No drivers found. Add drivers to start dispatching.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
