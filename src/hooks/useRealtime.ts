/**
 * useRealtime Hook
 *
 * Manages Supabase real-time subscriptions for live data updates
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

type TableName = 'requests' | 'drivers' | 'assignments' | 'messages' | 'ai_sessions';

/**
 * Subscribe to real-time updates for a specific table
 */
export function useRealtimeSubscription(
  table: TableName,
  filter?: { column: string; value: string }
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
        },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);

          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: [table] });

          // Show toast notification for certain events
          if (payload.eventType === 'INSERT') {
            if (table === 'requests') {
              toast.info('New dispatch request created');
            } else if (table === 'assignments') {
              toast.info('New driver assignment');
            }
          } else if (payload.eventType === 'UPDATE') {
            if (table === 'requests' && payload.new.status !== payload.old.status) {
              toast.info(`Request status changed to ${payload.new.status}`);
            } else if (table === 'drivers' && payload.new.status !== payload.old.status) {
              toast.info(`Driver status changed to ${payload.new.status}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter?.column, filter?.value, queryClient]);
}

/**
 * Subscribe to real-time updates for requests
 */
export function useRealtimeRequests(tenantId?: string) {
  useRealtimeSubscription(
    'requests',
    tenantId ? { column: 'tenant_id', value: tenantId } : undefined
  );
}

/**
 * Subscribe to real-time updates for drivers
 */
export function useRealtimeDrivers(tenantId?: string) {
  useRealtimeSubscription(
    'drivers',
    tenantId ? { column: 'tenant_id', value: tenantId } : undefined
  );
}

/**
 * Subscribe to real-time updates for assignments
 */
export function useRealtimeAssignments() {
  useRealtimeSubscription('assignments');
}

/**
 * Subscribe to real-time updates for AI chat messages
 */
export function useRealtimeMessages(sessionId?: string) {
  useRealtimeSubscription(
    'messages',
    sessionId ? { column: 'session_id', value: sessionId } : undefined
  );
}
