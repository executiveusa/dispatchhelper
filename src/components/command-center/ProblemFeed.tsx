/**
 * Problem Feed
 * 
 * Shows issues and exceptions requiring attention:
 * - Late risk loads
 * - Missing documents
 * - Detention running
 * - Angry broker/driver messages
 * - No tracking updates
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, FileX, MessageSquare, MapPinOff, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Problem {
  id: string;
  type: 'late_risk' | 'missing_docs' | 'detention' | 'no_tracking' | 'communication';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  suggested_action?: string;
}

const severityConfig = {
  low: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: MessageSquare },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  high: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
  critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
};

const typeIcons = {
  late_risk: Clock,
  missing_docs: FileX,
  detention: Clock,
  no_tracking: MapPinOff,
  communication: MessageSquare,
};

function ProblemCard({ problem }: { problem: Problem }) {
  const SeverityIcon = severityConfig[problem.severity].icon;
  const TypeIcon = typeIcons[problem.type];

  return (
    <Card className="border-l-4 border-l-spatchy-coral">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`p-2 rounded-full ${severityConfig[problem.severity].color}`}>
              <SeverityIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {problem.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {problem.description}
                </p>
              </div>
              <Badge variant="outline" className={severityConfig[problem.severity].color}>
                {problem.severity}
              </Badge>
            </div>

            {problem.suggested_action && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  💡 Suggested Action
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  {problem.suggested_action}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(problem.created_at), 'MMM d, h:mm a')}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  View Details
                </Button>
                <Button size="sm" className="h-8 text-xs bg-spatchy-coral hover:bg-spatchy-coral/90">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProblemFeed() {
  // Mock data - in production, this would come from events/alerts table
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      // For now, detect problems from loads and events
      const { data: loads } = await supabase
        .from('loads')
        .select('*')
        .eq('status', 'problem');

      // Convert problem loads to problem records
      const problemRecords: Problem[] = (loads || []).map(load => ({
        id: load.id,
        type: 'late_risk' as const,
        severity: 'high' as const,
        title: `Load ${load.reference || load.id.slice(0, 8)} at Risk`,
        description: `${load.pickup_location} → ${load.dropoff_location}`,
        entity_type: 'load',
        entity_id: load.id,
        created_at: load.updated_at || load.created_at,
        suggested_action: 'Contact driver and broker to confirm status and update ETA',
      }));

      return problemRecords;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Problems & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Problems & Alerts</span>
            <Badge variant="secondary">{problems?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {problems && problems.length > 0 ? (
        <div className="space-y-3">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              All Clear! 🎉
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No problems or alerts at this time. Keep up the great work!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
