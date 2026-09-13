/**
 * Usage Statistics Component
 * 
 * Displays AI usage metrics and automation value for the tenant:
 * - Daily/weekly AI call usage
 * - Token consumption
 * - Estimated costs
 * - Time saved through automation
 * - Automation value metrics
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Clock, DollarSign } from 'lucide-react';

interface UsageStatisticsProps {
  tenantId: string;
}

interface UsageStats {
  todayCalls: number;
  todayTokens: number;
  todayCost: number;
  maxCallsPerDay: number;
  maxTokensPerDay: number;
  maxCostPerDay: number;
  weeklyTimeSaved: number; // in hours
  weeklyLoadsAutomated: number;
  avgRatePerMile: number;
}

export function UsageStatistics({ tenantId }: UsageStatisticsProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tenantId]);

  async function loadStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Get today's usage
      const { data: todayUsage } = await supabase
        .from('ai_usage_log')
        .select('total_tokens, estimated_cost')
        .eq('tenant_id', tenantId)
        .gte('created_at', today.toISOString());

      const todayCalls = todayUsage?.length || 0;
      const todayTokens = todayUsage?.reduce((sum, u) => sum + (u.total_tokens || 0), 0) || 0;
      const todayCost = todayUsage?.reduce((sum, u) => sum + (u.estimated_cost || 0), 0) || 0;

      // Get tenant limits
      const { data: limits } = await supabase
        .from('tenant_limits')
        .select('max_ai_calls_per_day, max_tokens_per_day, max_cost_per_day')
        .eq('tenant_id', tenantId)
        .single();

      // Get weekly automation events
      const { data: weeklyEvents } = await supabase
        .from('events')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('event_type', 'ai_action')
        .gte('created_at', weekAgo.toISOString());

      // Calculate time saved (rough estimate: 5 min per automated action)
      const weeklyTimeSaved = ((weeklyEvents?.length || 0) * 5) / 60; // in hours

      // Count loads automated
      const weeklyLoadsAutomated = weeklyEvents?.filter(
        (e) => e.metadata?.tool_name === 'create_load' || e.metadata?.tool_name === 'assign_driver'
      ).length || 0;

      // Get average rate per mile from recent loads
      const { data: recentLoads } = await supabase
        .from('loads')
        .select('rate')
        .eq('tenant_id', tenantId)
        .not('rate', 'is', null)
        .gte('created_at', weekAgo.toISOString())
        .limit(50);

      const avgRatePerMile = recentLoads?.length
        ? recentLoads.reduce((sum, l) => sum + (l.rate || 0), 0) / recentLoads.length / 300 // Assume 300 miles avg
        : 0;

      setStats({
        todayCalls,
        todayTokens,
        todayCost: todayCost / 100, // Convert cents to dollars
        maxCallsPerDay: limits?.max_ai_calls_per_day || 1000,
        maxTokensPerDay: limits?.max_tokens_per_day || 100000,
        maxCostPerDay: limits?.max_cost_per_day || 50,
        weeklyTimeSaved,
        weeklyLoadsAutomated,
        avgRatePerMile,
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const callsPercent = (stats.todayCalls / stats.maxCallsPerDay) * 100;
  const tokensPercent = (stats.todayTokens / stats.maxTokensPerDay) * 100;
  const costPercent = (stats.todayCost / stats.maxCostPerDay) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Usage & Automation Value
        </CardTitle>
        <CardDescription>
          AI usage and automation metrics
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Automation Value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Time Saved</span>
            </div>
            <p className="text-2xl font-bold">{stats.weeklyTimeSaved.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">This week via automation</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Loads Automated</span>
            </div>
            <p className="text-2xl font-bold">{stats.weeklyLoadsAutomated}</p>
            <p className="text-xs text-muted-foreground">Created/assigned by AI</p>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Avg RPM</span>
            </div>
            <p className="text-2xl font-bold">${stats.avgRatePerMile.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Rate per mile</p>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="space-y-4 pt-4 border-t">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AI Calls Today</span>
              <Badge variant={callsPercent > 80 ? 'destructive' : 'default'}>
                {stats.todayCalls} / {stats.maxCallsPerDay}
              </Badge>
            </div>
            <Progress value={callsPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {callsPercent.toFixed(0)}% of daily limit
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tokens Used Today</span>
              <Badge variant={tokensPercent > 80 ? 'destructive' : 'default'}>
                {(stats.todayTokens / 1000).toFixed(1)}K / {(stats.maxTokensPerDay / 1000).toFixed(0)}K
              </Badge>
            </div>
            <Progress value={tokensPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {tokensPercent.toFixed(0)}% of daily limit
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Estimated Cost Today</span>
              <Badge variant={costPercent > 80 ? 'destructive' : 'default'}>
                ${stats.todayCost.toFixed(2)} / ${stats.maxCostPerDay.toFixed(2)}
              </Badge>
            </div>
            <Progress value={costPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {costPercent.toFixed(0)}% of daily budget
            </p>
          </div>
        </div>

        {/* Warning if approaching limits */}
        {(callsPercent > 80 || tokensPercent > 80 || costPercent > 80) && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-600">
              <strong>Approaching daily limit:</strong> Consider increasing limits or optimizing AI usage.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
