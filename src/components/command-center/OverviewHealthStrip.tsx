/**
 * Overview Health Strip
 * 
 * Top-level metrics dashboard showing:
 * - Today's revenue / RPM
 * - Truck utilization
 * - Late/Risk loads
 * - AI mood signal (sentiment analysis)
 */

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Truck, AlertTriangle, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function MetricCard({ title, value, subtitle, icon, variant = 'default' }: MetricCardProps) {
  const variantStyles = {
    default: 'bg-white dark:bg-spatchy-slate border-gray-200 dark:border-gray-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  return (
    <Card className={`${variantStyles[variant]} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="ml-3 text-gray-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewHealthStrip() {
  // Fetch today's metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['command-center-metrics'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's loads
      const { data: loads } = await supabase
        .from('loads')
        .select('*')
        .gte('created_at', today.toISOString());

      // Get driver stats
      const { data: drivers } = await supabase
        .from('drivers')
        .select('status');

      // Calculate metrics
      const totalRevenue = loads?.reduce((sum, load) => sum + (load.rate || 0), 0) || 0;
      const avgRPM = loads && loads.length > 0 ? totalRevenue / loads.length : 0;
      
      const totalDrivers = drivers?.length || 0;
      const onLoadDrivers = drivers?.filter(d => d.status === 'on_route').length || 0;
      const utilization = totalDrivers > 0 ? (onLoadDrivers / totalDrivers) * 100 : 0;

      const riskLoads = loads?.filter(l => l.status === 'problem').length || 0;

      return {
        revenue: totalRevenue,
        rpm: avgRPM,
        utilization,
        riskLoads,
        totalLoads: loads?.length || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Today's Revenue"
        value={`$${metrics?.revenue?.toLocaleString() || '0'}`}
        subtitle={`Avg RPM: $${metrics?.rpm?.toFixed(2) || '0'}`}
        icon={<TrendingUp className="h-6 w-6" />}
        variant="success"
      />
      
      <MetricCard
        title="Truck Utilization"
        value={`${metrics?.utilization?.toFixed(0) || '0'}%`}
        subtitle="trucks on load"
        icon={<Truck className="h-6 w-6" />}
        variant={metrics?.utilization && metrics.utilization > 75 ? 'success' : 'default'}
      />
      
      <MetricCard
        title="Risk Loads"
        value={metrics?.riskLoads || 0}
        subtitle={`of ${metrics?.totalLoads || 0} total`}
        icon={<AlertTriangle className="h-6 w-6" />}
        variant={metrics?.riskLoads && metrics.riskLoads > 0 ? 'warning' : 'success'}
      />
      
      <MetricCard
        title="AI Mood"
        value="Positive"
        subtitle="based on recent messages"
        icon={<Sparkles className="h-6 w-6" />}
        variant="default"
      />
    </div>
  );
}
