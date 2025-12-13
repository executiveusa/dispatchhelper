/**
 * Request Service
 *
 * Handles all operations related to dispatch requests/loads
 */

import { supabase } from '../lib/supabase';
import type { Request, CreateRequestInput, UpdateRequestInput } from '../types';

/**
 * Fetch all requests for the current tenant
 */
export async function getRequests(tenantId?: string) {
  let query = supabase.from('requests').select('*').order('created_at', { ascending: false });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Request[];
}

/**
 * Fetch a single request by ID
 */
export async function getRequest(id: string) {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Request;
}

/**
 * Create a new request
 */
export async function createRequest(input: CreateRequestInput, tenantId?: string, userId?: string) {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      ...input,
      tenant_id: tenantId || null,
      created_by: userId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Request;
}

/**
 * Update an existing request
 */
export async function updateRequest(id: string, input: UpdateRequestInput) {
  const { data, error } = await supabase
    .from('requests')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Request;
}

/**
 * Delete a request
 */
export async function deleteRequest(id: string) {
  const { error } = await supabase.from('requests').delete().eq('id', id);

  if (error) throw error;
  return { success: true };
}

/**
 * Get pending requests (not yet assigned)
 */
export async function getPendingRequests(tenantId?: string) {
  let query = supabase
    .from('requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Request[];
}

/**
 * Get requests by status
 */
export async function getRequestsByStatus(
  status: Request['status'],
  tenantId?: string
) {
  let query = supabase
    .from('requests')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Request[];
}
