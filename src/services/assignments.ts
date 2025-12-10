/**
 * Assignment Service
 *
 * Handles driver-to-request assignments
 */

import { supabase } from '../lib/supabase';
import type { Assignment, AssignDriverInput } from '../types';

/**
 * Fetch all assignments
 */
export async function getAssignments() {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      request:requests(*),
      driver:drivers(*)
    `)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single assignment
 */
export async function getAssignment(id: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      request:requests(*),
      driver:drivers(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new assignment
 */
export async function createAssignment(input: AssignDriverInput, assignedBy?: string) {
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      request_id: input.request_id,
      driver_id: input.driver_id,
      assigned_by: assignedBy || null,
      notes: input.notes,
      status: 'assigned',
    })
    .select()
    .single();

  if (error) throw error;

  // Update request status to 'assigned'
  await supabase
    .from('requests')
    .update({ status: 'assigned' })
    .eq('id', input.request_id);

  // Update driver status to 'assigned'
  await supabase
    .from('drivers')
    .update({ status: 'assigned' })
    .eq('id', input.driver_id);

  return data as Assignment;
}

/**
 * Update assignment status
 */
export async function updateAssignmentStatus(
  id: string,
  status: Assignment['status']
) {
  const updateData: any = { status };

  // Set timestamps based on status
  if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString();
  } else if (status === 'in_progress') {
    updateData.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('assignments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update related request status
  if (status === 'in_progress') {
    await supabase
      .from('requests')
      .update({ status: 'in_transit' })
      .eq('id', data.request_id);
  } else if (status === 'completed') {
    await supabase
      .from('requests')
      .update({ status: 'delivered' })
      .eq('id', data.request_id);

    // Mark driver as available
    await supabase
      .from('drivers')
      .update({ status: 'available' })
      .eq('id', data.driver_id);
  } else if (status === 'declined' || status === 'cancelled') {
    await supabase
      .from('requests')
      .update({ status: 'pending' })
      .eq('id', data.request_id);

    // Mark driver as available
    await supabase
      .from('drivers')
      .update({ status: 'available' })
      .eq('id', data.driver_id);
  }

  return data as Assignment;
}

/**
 * Get assignments for a specific request
 */
export async function getAssignmentsByRequest(requestId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      driver:drivers(*)
    `)
    .eq('request_id', requestId)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get assignments for a specific driver
 */
export async function getAssignmentsByDriver(driverId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      request:requests(*)
    `)
    .eq('driver_id', driverId)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Cancel an assignment
 */
export async function cancelAssignment(id: string) {
  return updateAssignmentStatus(id, 'cancelled');
}
