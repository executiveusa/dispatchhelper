/**
 * System Health Component
 * 
 * Displays system status and observability metrics:
 * - Supabase connectivity
 * - Last successful AI call
 * - Failed automations queue
 * - Edge function health
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface SystemHealthProps {
  tenantId: string;
}

interface HealthStatus {
  supabase: 'healthy' | 'unhealthy' | 'unknown';
  lastAICall: Date | null;
  aiCallStatus: 'success' | 'failed' | 'none';
  failedAutomations: number;
  recentErrors: Array<{ message: string; timestamp: Date }>;
}

export function SystemHealth({ tenantId }: SystemHealthProps) {
  const [health, setHealth] = useState<HealthStatus>({
    supabase: 'unknown',
    lastAICall: null,
    aiCallStatus: 'none',
    failedAutomations: 0,
    recentErrors: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    // Refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [tenantId]);

  async function checkHealth() {
    try {
      // Check Supabase connectivity
      const { error: connectionError } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .single();

      const supabaseStatus = connectionError ? 'unhealthy' : 'healthy';

      // Check last AI action from events
      const { data: lastAIEvent, error: aiError } = await supabase
        .from('events')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('event_type', 'ai_action')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let lastAICall = null;
      let aiCallStatus: 'success' | 'failed' | 'none' = 'none';

      if (!aiError && lastAIEvent) {
        lastAICall = new Date(lastAIEvent.created_at);
        aiCallStatus = lastAIEvent.metadata?.outputs?.success === false ? 'failed' : 'success';
      }

      // Check for failed automations (AI actions with errors in last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data: failedEvents, error: failedError } = await supabase
        .from('events')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('event_type', 'ai_action')
        .gte('created_at', oneHourAgo.toISOString());

      const failedCount = failedEvents?.filter(
        (e) => e.metadata?.outputs?.error || e.metadata?.outputs?.success === false
      ).length || 0;

      // Get recent errors
      const recentErrors = failedEvents
        ?.filter((e) => e.metadata?.outputs?.error)
        .slice(0, 3)
        .map((e) => ({
          message: e.metadata.outputs.error,
          timestamp: new Date(e.created_at),
        })) || [];

      setHealth({
        supabase: supabaseStatus,
        lastAICall,
        aiCallStatus,
        failedAutomations: failedCount,
        recentErrors,
      });
    } catch (error) {
      console.error('Error checking system health:', error);
      setHealth((prev) => ({ ...prev, supabase: 'unhealthy' }));
    } finally {
      setLoading(false);
    }
  }

  const overallStatus = health.supabase === 'healthy' && health.failedAutomations === 0
    ? 'healthy'
    : health.supabase === 'unhealthy'
    ? 'critical'
    : 'warning';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time monitoring and observability
            </CardDescription>
          </div>
          <Badge
            variant={
              overallStatus === 'healthy'
                ? 'default'
                : overallStatus === 'critical'
                ? 'destructive'
                : 'secondary'
            }
          >
            {overallStatus === 'healthy' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {overallStatus === 'critical' && <XCircle className="w-3 h-3 mr-1" />}
            {overallStatus === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {overallStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Checking system health...</p>
        ) : (
          <>
            {/* Supabase Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {health.supabase === 'healthy' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <span className="font-medium">Database Connection</span>
              </div>
              <Badge variant={health.supabase === 'healthy' ? 'default' : 'destructive'}>
                {health.supabase}
              </Badge>
            </div>

            {/* Last AI Call */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {health.aiCallStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : health.aiCallStatus === 'failed' ? (
                  <XCircle className="w-4 h-4 text-destructive" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-medium">Last AI Call</span>
              </div>
              <div className="text-right">
                {health.lastAICall ? (
                  <>
                    <p className="text-sm font-medium">
                      {format(health.lastAICall, 'h:mm a')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(health.lastAICall, 'MMM d')}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No calls yet</p>
                )}
              </div>
            </div>

            {/* Failed Automations */}
            {health.failedAutomations > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">
                      {health.failedAutomations} Failed Automation{health.failedAutomations > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In the last hour
                    </p>
                  </div>
                </div>

                {/* Recent Errors */}
                {health.recentErrors.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {health.recentErrors.map((error, index) => (
                      <div
                        key={index}
                        className="p-2 rounded bg-background border text-xs"
                      >
                        <p className="font-mono text-destructive">{error.message}</p>
                        <p className="text-muted-foreground mt-1">
                          {format(error.timestamp, 'h:mm:ss a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Clear Message */}
            {health.supabase === 'healthy' && health.failedAutomations === 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600 font-medium">
                    All systems operational
                  </p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>Updates every 30 seconds</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
