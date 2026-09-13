/**
 * Supabase Client Configuration for Spatchy AI
 *
 * This file provides a configured Supabase client for use throughout
 * the application. It handles authentication, database queries, and
 * real-time subscriptions.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

/**
 * Supabase client instance with TypeScript types
 *
 * This client is configured with:
 * - Type-safe database operations
 * - Automatic session management
 * - Real-time subscriptions
 * - Row-level security enforcement
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Helper function to handle Supabase errors
 */
export const handleSupabaseError = (error: any): never => {
  console.error('Supabase error:', error);
  throw new Error(error?.message || 'An unexpected error occurred');
};

/**
 * Type-safe query builder helpers
 */
export const db = {
  profiles: () => supabase.from('profiles'),
  tenants: () => supabase.from('tenants'),
  tenantUsers: () => supabase.from('tenant_users'),
  drivers: () => supabase.from('drivers'),
  requests: () => supabase.from('requests'),
  assignments: () => supabase.from('assignments'),
  aiSessions: () => supabase.from('ai_sessions'),
  messages: () => supabase.from('messages'),
  activityLog: () => supabase.from('activity_log'),
};

export default supabase;
