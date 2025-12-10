/**
 * Update Status Edge Function
 *
 * Updates the status of a dispatch request
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

    const { request_id, status, tenant_id } = await req.json();

    if (!request_id || !status) {
      throw new Error('request_id and status are required');
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

    const validStatuses = ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // CRITICAL: Verify request belongs to tenant before updating
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('id, tenant_id')
      .eq('id', request_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (requestError || !request) {
      throw new Error('Request not found or does not belong to this tenant');
    }

    const { data, error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', request_id)
      .eq('tenant_id', tenant_id) // Extra safety
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
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
