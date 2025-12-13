/**
 * Tenant Service
 *
 * Manages multi-tenant organizations and user memberships
 */

import { supabase } from '../lib/supabase';
import type { Tenant } from '../types';

/**
 * Get all tenants for the current user
 */
export async function getUserTenants(userId: string) {
  const { data, error } = await supabase
    .from('tenant_users')
    .select(`
      *,
      tenant:tenants(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data.map((tu: any) => tu.tenant) as Tenant[];
}

/**
 * Get a single tenant
 */
export async function getTenant(id: string) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Tenant;
}

/**
 * Create a new tenant
 */
export async function createTenant(name: string, slug: string, userId: string) {
  // Create tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name,
      slug,
    })
    .select()
    .single();

  if (tenantError) throw tenantError;

  // Add creator as owner
  const { error: memberError } = await supabase
    .from('tenant_users')
    .insert({
      tenant_id: tenant.id,
      user_id: userId,
      role: 'owner',
    });

  if (memberError) throw memberError;

  return tenant as Tenant;
}

/**
 * Update tenant
 */
export async function updateTenant(
  id: string,
  updates: { name?: string; logo_url?: string; settings?: any }
) {
  const { data, error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Tenant;
}

/**
 * Delete tenant
 */
export async function deleteTenant(id: string) {
  const { error } = await supabase.from('tenants').delete().eq('id', id);

  if (error) throw error;
  return { success: true };
}

/**
 * Get tenant members
 */
export async function getTenantMembers(tenantId: string) {
  const { data, error } = await supabase
    .from('tenant_users')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  return data;
}

/**
 * Add user to tenant
 */
export async function addTenantMember(
  tenantId: string,
  userId: string,
  role: 'owner' | 'admin' | 'dispatcher' | 'driver' | 'member'
) {
  const { data, error } = await supabase
    .from('tenant_users')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove user from tenant
 */
export async function removeTenantMember(tenantId: string, userId: string) {
  const { error } = await supabase
    .from('tenant_users')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}

/**
 * Update member role
 */
export async function updateMemberRole(
  tenantId: string,
  userId: string,
  role: 'owner' | 'admin' | 'dispatcher' | 'driver' | 'member'
) {
  const { data, error } = await supabase
    .from('tenant_users')
    .update({ role })
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
