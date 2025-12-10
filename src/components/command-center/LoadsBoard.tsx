/**
 * Active Loads Board
 * 
 * Kanban-style board for managing loads across statuses:
 * - New: Newly created loads
 * - Quoted: Loads with rate quotes pending
 * - Booked: Confirmed loads
 * - In Transit: Currently being transported
 * - Delivered: Completed loads
 * - Problem: Loads with issues
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface Load {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_time?: string;
  dropoff_time?: string;
  status: string;
  rate?: number;
  reference?: string;
  lane_key?: string;
}

interface LoadsBoardProps {
  selectedLoadId: string | null;
  onSelectLoad: (id: string) => void;
}

const statusColumns = [
  { id: 'new', label: 'New', color: '#3b82f6' },
  { id: 'quoted', label: 'Quoted', color: '#8b5cf6' },
  { id: 'booked', label: 'Booked', color: '#22c55e' },
  { id: 'in_transit', label: 'In Transit', color: '#eab308' },
  { id: 'problem', label: 'Problem', color: '#ef4444' },
];

function LoadCard({ load, isSelected, onClick }: { 
  load: Load; 
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isSelected ? 'ring-2 ring-spatchy-coral' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Reference and Lane */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono font-semibold text-spatchy-coral">
              {load.reference || 'No Ref'}
            </span>
            {load.lane_key && (
              <Badge variant="outline" className="text-xs">
                {load.lane_key}
              </Badge>
            )}
          </div>

          {/* Pickup */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {load.pickup_location}
              </p>
              {load.pickup_time && (
                <p className="text-xs text-gray-500">
                  {format(new Date(load.pickup_time), 'MMM d, h:mm a')}
                </p>
              )}
            </div>
          </div>

          {/* Dropoff */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {load.dropoff_location}
              </p>
              {load.dropoff_time && (
                <p className="text-xs text-gray-500">
                  {format(new Date(load.dropoff_time), 'MMM d, h:mm a')}
                </p>
              )}
            </div>
          </div>

          {/* Rate */}
          {load.rate && (
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">${load.rate.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadsBoard({ selectedLoadId, onSelectLoad }: LoadsBoardProps) {
  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Load[];
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column) => (
          <Card key={column.id} className="animate-pulse bg-gray-100 dark:bg-gray-800">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Group loads by status
  const loadsByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = loads?.filter(load => load.status === column.id) || [];
    return acc;
  }, {} as Record<string, Load[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {statusColumns.map((column) => (
        <div key={column.id} className="space-y-4">
          <Card className="border-t-4" style={{ borderTopColor: column.color }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>{column.label}</span>
                <Badge variant="secondary" className="ml-2">
                  {loadsByStatus[column.id]?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <div className="space-y-3">
            {loadsByStatus[column.id]?.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                isSelected={load.id === selectedLoadId}
                onClick={() => onSelectLoad(load.id)}
              />
            ))}
            
            {loadsByStatus[column.id]?.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No {column.label.toLowerCase()} loads
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
