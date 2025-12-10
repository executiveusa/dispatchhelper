/**
 * Driver Service
 *
 * Handles all operations related to drivers
 */

import { supabase } from '../lib/supabase';
import type { Driver, CreateDriverInput, UpdateDriverInput } from '../types';

/**
 * Fetch all drivers for the current tenant
 */
export async function getDrivers(tenantId?: string) {
  let query = supabase.from('drivers').select('*').order('name', { ascending: true });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Driver[];
}

/**
 * Fetch a single driver by ID
 */
export async function getDriver(id: string) {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Driver;
}

/**
 * Create a new driver
 */
export async function createDriver(input: CreateDriverInput, tenantId?: string) {
  const { data, error } = await supabase
    .from('drivers')
    .insert({
      ...input,
      tenant_id: tenantId || null,
      status: 'available',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

/**
 * Update an existing driver
 */
export async function updateDriver(id: string, input: UpdateDriverInput) {
  const { data, error } = await supabase
    .from('drivers')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

/**
 * Delete a driver
 */
export async function deleteDriver(id: string) {
  const { error } = await supabase.from('drivers').delete().eq('id', id);

  if (error) throw error;
  return { success: true };
}

/**
 * Get available drivers (status = 'available')
 */
export async function getAvailableDrivers(tenantId?: string) {
  let query = supabase
    .from('drivers')
    .select('*')
    .eq('status', 'available')
    .order('name', { ascending: true });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Driver[];
}

/**
 * Update driver status
 */
export async function updateDriverStatus(
  id: string,
  status: Driver['status']
) {
  const { data, error } = await supabase
    .from('drivers')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}

/**
 * Update driver location
 */
export async function updateDriverLocation(
  id: string,
  location: string
) {
  const { data, error } = await supabase
    .from('drivers')
    .update({
      current_location: location,
      location_updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Driver;
}
