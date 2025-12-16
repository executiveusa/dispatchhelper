/**
 * Assign Driver Edge Function
 *
 * Assigns a driver to a dispatch request
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { request_id, driver_id, notes, tenant_id } = await req.json();

    if (!request_id || !driver_id) {
      throw new Error('request_id and driver_id are required');
    }

    // CRITICAL: Require tenant_id
    if (!tenant_id) {
      throw new Error('tenant_id is required');
    }

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // CRITICAL: Validate user belongs to tenant
    const { data: membership, error: membershipError } = await supabase
      .from('tenant_users')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      throw new Error('SECURITY: User does not belong to this tenant');
    }

    // CRITICAL: Verify request belongs to tenant
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('id, tenant_id')
      .eq('id', request_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (requestError || !request) {
      throw new Error('Request not found or does not belong to this tenant');
    }

    // CRITICAL: Verify driver belongs to tenant
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, tenant_id')
      .eq('id', driver_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (driverError || !driver) {
      throw new Error('Driver not found or does not belong to this tenant');
    }

    // Create assignment
    const { data: assignment, error: assignError } = await supabase
      .from('assignments')
      .insert({
        request_id,
        driver_id,
        notes,
      })
      .select()
      .single();

    if (assignError) throw assignError;

    // Update request status
    await supabase
      .from('requests')
      .update({ status: 'assigned' })
      .eq('id', request_id)
      .eq('tenant_id', tenant_id); // Extra safety

    // Update driver status
    await supabase
      .from('drivers')
      .update({ status: 'assigned' })
      .eq('id', driver_id)
      .eq('tenant_id', tenant_id); // Extra safety

    return new Response(
      JSON.stringify({ success: true, data: assignment }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
