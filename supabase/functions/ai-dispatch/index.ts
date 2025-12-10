/**
 * Spatchy AI - AI Dispatch Edge Function
 *
 * This is the core AI agent for Spatchy AI. It orchestrates dispatch
 * operations using an LLM with tool-calling capabilities.
 *
 * Features:
 * - Multi-step reasoning with Claude or GPT-4
 * - Tool execution (create_request, assign_driver, update_status, send_message)
 * - Memory persistence via ai_sessions table
 * - Real-time dispatch automation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types
interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | any;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

// Environment variables
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Tool definitions
const tools: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'create_load',
      description: 'Create a new load in the system',
      parameters: {
        type: 'object',
        properties: {
          pickup_location: { type: 'string', description: 'Pickup location' },
          dropoff_location: { type: 'string', description: 'Dropoff location' },
          pickup_time: { type: 'string', description: 'Pickup datetime (ISO 8601)' },
          dropoff_time: { type: 'string', description: 'Dropoff datetime (ISO 8601)' },
          rate: { type: 'number', description: 'Rate for this load' },
          reference: { type: 'string', description: 'Load/BOL reference number' },
          lane_key: { type: 'string', description: 'Lane key (e.g., ATL-CHI)' },
          broker_id: { type: 'string', description: 'UUID of the broker' },
          notes: { type: 'string', description: 'Additional notes' },
        },
        required: ['pickup_location', 'dropoff_location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'assign_driver',
      description: 'Assign a driver to a load',
      parameters: {
        type: 'object',
        properties: {
          load_id: { type: 'string', description: 'UUID of the load' },
          driver_id: { type: 'string', description: 'UUID of the driver' },
          notes: { type: 'string', description: 'Assignment notes' },
        },
        required: ['load_id', 'driver_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_load_status',
      description: 'Update the status of a load',
      parameters: {
        type: 'object',
        properties: {
          load_id: { type: 'string', description: 'UUID of the load' },
          status: {
            type: 'string',
            enum: ['new', 'quoted', 'booked', 'in_transit', 'delivered', 'cancelled', 'problem'],
            description: 'New status',
          },
        },
        required: ['load_id', 'status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_available_drivers',
      description: 'Get list of available drivers in the system',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Filter by driver status' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_loads',
      description: 'Get list of loads in the system, optionally filtered by status',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Filter by load status' },
          limit: { type: 'number', description: 'Max number of loads to return' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'propose_lane_plan',
      description: 'Propose a lane utilization plan for available trucks',
      parameters: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', description: 'Timeframe to plan for (e.g., "tomorrow", "next week")' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'summarize_day',
      description: 'Summarize dispatch operations for a given day',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date to summarize (ISO 8601, defaults to today)' },
        },
      },
    },
  },
];

// Validate user belongs to tenant
async function validateTenantMembership(
  supabase: any,
  tenantId: string,
  userId: string
): Promise<void> {
  const { data: membership, error } = await supabase
    .from('tenant_users')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .single();

  if (error || !membership) {
    throw new Error('SECURITY: User does not belong to this tenant');
  }
}

// Check automation mode for tenant
async function checkAutomationMode(
  supabase: any,
  tenantId: string
): Promise<'suggest_only' | 'auto_act'> {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('settings')
    .eq('id', tenantId)
    .single();

  if (error || !tenant) {
    // Default to safe mode if tenant not found
    return 'suggest_only';
  }

  const settings = tenant.settings || {};
  return settings.automation_mode || 'suggest_only';
}

// Log AI action to events table
async function logAIAction(
  supabase: any,
  tenantId: string,
  userId: string,
  toolName: string,
  inputs: any,
  outputs: any,
  reasoning: string
): Promise<void> {
  await supabase.from('events').insert({
    tenant_id: tenantId,
    event_type: 'ai_action',
    description: \`AI tool executed: \${toolName}\`,
    metadata: {
      tool_name: toolName,
      inputs,
      outputs,
      reasoning,
      user_id: userId,
      timestamp: new Date().toISOString(),
    },
  });
}

// Tool execution handlers
async function executeTool(
  toolName: string,
  args: any,
  supabase: any,
  tenantId: string,
  userId: string,
  automationMode: 'suggest_only' | 'auto_act' = 'suggest_only'
): Promise<any> {
  console.log(\`Executing tool: \${toolName}\`, args);

  // CRITICAL: Validate tenant membership before any operation
  await validateTenantMembership(supabase, tenantId, userId);

  switch (toolName) {
    case 'create_load': {
      const loadData = {
        tenant_id: tenantId,
        created_by: userId,
        ...args,
      };

      // Check automation mode
      if (automationMode === 'suggest_only') {
        // Return suggestion without writing
        const suggestion = {
          action: 'create_load',
          proposed: loadData,
          reasoning: 'AI suggests creating this load based on provided details',
          requires_approval: true,
          mode: 'suggest_only',
        };

        // Log the suggestion
        await logAIAction(
          supabase,
          tenantId,
          userId,
          'create_load',
          args,
          { suggested: true },
          'AI proposed creating a new load'
        );

        return suggestion;
      }

      // Execute in auto_act mode
      const { data, error } = await supabase
        .from('loads')
        .insert(loadData)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await logAIAction(
        supabase,
        tenantId,
        userId,
        'create_load',
        args,
        { success: true, load_id: data.id },
        \`AI created load from \${args.pickup_location} to \${args.dropoff_location}\`
      );

      return { success: true, load: data, mode: 'auto_act' };
    }

    case 'assign_driver': {
      const loadId = args.load_id || args.request_id; // Support both parameter names for compatibility

      // Verify load belongs to tenant
      const { data: load, error: loadCheckError } = await supabase
        .from('loads')
        .select('id, tenant_id, pickup_location, dropoff_location')
        .eq('id', loadId)
        .eq('tenant_id', tenantId)
        .single();

      if (loadCheckError || !load) {
        throw new Error('Load not found or does not belong to this tenant');
      }

      // Verify driver belongs to tenant
      const { data: driver, error: driverCheckError } = await supabase
        .from('drivers')
        .select('id, name, tenant_id')
        .eq('id', args.driver_id)
        .eq('tenant_id', tenantId)
        .single();

      if (driverCheckError || !driver) {
        throw new Error('Driver not found or does not belong to this tenant');
      }

      // Check automation mode
      if (automationMode === 'suggest_only') {
        const suggestion = {
          action: 'assign_driver',
          proposed: {
            load_id: loadId,
            driver_id: args.driver_id,
            driver_name: driver.name,
            load_route: \`\${load.pickup_location} → \${load.dropoff_location}\`,
          },
          reasoning: args.notes || 'AI suggests assigning this driver based on availability and location',
          requires_approval: true,
          mode: 'suggest_only',
        };

        await logAIAction(
          supabase,
          tenantId,
          userId,
          'assign_driver',
          args,
          { suggested: true },
          \`AI proposed assigning driver \${driver.name} to load \${loadId}\`
        );

        return suggestion;
      }

      // Execute in auto_act mode
      // Update load with driver assignment
      const { data: loadData, error: loadError } = await supabase
        .from('loads')
        .update({ 
          driver_id: args.driver_id,
          status: 'booked'
        })
        .eq('id', loadId)
        .eq('tenant_id', tenantId) // Extra safety check
        .select()
        .single();

      if (loadError) throw loadError;

      // Create assignment record
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          request_id: loadId,
          driver_id: args.driver_id,
          assigned_by: userId,
          notes: args.notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Update driver status
      await supabase
        .from('drivers')
        .update({ status: 'assigned' })
        .eq('id', args.driver_id)
        .eq('tenant_id', tenantId); // Extra safety check

      // Log the action
      await logAIAction(
        supabase,
        tenantId,
        userId,
        'assign_driver',
        args,
        { success: true, assignment_id: data.id },
        \`AI assigned driver \${driver.name} to load from \${load.pickup_location} to \${load.dropoff_location}\`
      );

      return { success: true, assignment: data, load: loadData, mode: 'auto_act' };
    }

    case 'update_load_status': {
      // Verify load belongs to tenant
      const { data: loadCheck, error: checkError } = await supabase
        .from('loads')
        .select('id, status')
        .eq('id', args.load_id)
        .eq('tenant_id', tenantId)
        .single();

      if (checkError || !loadCheck) {
        throw new Error('Load not found or does not belong to this tenant');
      }

      // Check automation mode
      if (automationMode === 'suggest_only') {
        const suggestion = {
          action: 'update_load_status',
          proposed: {
            load_id: args.load_id,
            old_status: loadCheck.status,
            new_status: args.status,
          },
          reasoning: \`AI suggests updating load status from \${loadCheck.status} to \${args.status}\`,
          requires_approval: true,
          mode: 'suggest_only',
        };

        await logAIAction(
          supabase,
          tenantId,
          userId,
          'update_load_status',
          args,
          { suggested: true },
          \`AI proposed status change for load \${args.load_id}\`
        );

        return suggestion;
      }

      // Execute in auto_act mode
      const { data, error } = await supabase
        .from('loads')
        .update({ status: args.status })
        .eq('id', args.load_id)
        .eq('tenant_id', tenantId) // Extra safety check
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await logAIAction(
        supabase,
        tenantId,
        userId,
        'update_load_status',
        args,
        { success: true, new_status: args.status },
        \`AI updated load \${args.load_id} status to \${args.status}\`
      );

      return { success: true, load: data, mode: 'auto_act' };
    }

    case 'get_available_drivers': {
      const query = supabase
        .from('drivers')
        .select('*')
        .eq('tenant_id', tenantId);

      if (args.status) {
        query.eq('status', args.status);
      } else {
        query.eq('status', 'available');
      }

      const { data, error } = await query;
      if (error) throw error;
      return { drivers: data };
    }

    case 'get_loads': {
      let query = supabase
        .from('loads')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(args.limit || 10);

      if (args.status) {
        query = query.eq('status', args.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { loads: data };
    }

    case 'propose_lane_plan': {
      // Get available drivers
      const { data: drivers } = await supabase
        .from('drivers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'available');

      // Get recent loads to analyze lane patterns
      const { data: recentLoads } = await supabase
        .from('loads')
        .select('lane_key, rate')
        .eq('tenant_id', tenantId)
        .not('lane_key', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      // Analyze lane profitability
      const laneStats = recentLoads?.reduce((acc: any, load: any) => {
        if (!acc[load.lane_key]) {
          acc[load.lane_key] = { count: 0, totalRate: 0 };
        }
        acc[load.lane_key].count++;
        acc[load.lane_key].totalRate += load.rate || 0;
        return acc;
      }, {});

      const topLanes = Object.entries(laneStats || {})
        .map(([lane, stats]: [string, any]) => ({
          lane,
          avgRate: stats.totalRate / stats.count,
          frequency: stats.count,
        }))
        .sort((a: any, b: any) => b.avgRate - a.avgRate)
        .slice(0, 5);

      return {
        availableDrivers: drivers?.length || 0,
        topLanes,
        recommendation: \`You have \${drivers?.length || 0} available drivers. Consider focusing on these high-value lanes.\`,
      };
    }

    case 'summarize_day': {
      const targetDate = args.date ? new Date(args.date) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const { data: loads } = await supabase
        .from('loads')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('created_at', targetDate.toISOString())
        .lt('created_at', nextDay.toISOString());

      const totalRevenue = loads?.reduce((sum, load) => sum + (load.rate || 0), 0) || 0;
      const statusBreakdown = loads?.reduce((acc: any, load) => {
        acc[load.status] = (acc[load.status] || 0) + 1;
        return acc;
      }, {});

      return {
        date: targetDate.toISOString().split('T')[0],
        totalLoads: loads?.length || 0,
        totalRevenue,
        statusBreakdown,
        avgRate: loads?.length ? totalRevenue / loads.length : 0,
      };
    }

    default:
      throw new Error(\`Unknown tool: \${toolName}\`);
  }
}

// Call Anthropic Claude API
async function callClaude(messages: Message[]): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      tools: tools.map((t) => t.function),
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(\`Anthropic API error: \${response.statusText}\`);
  }

  return await response.json();
}

// Main handler
serve(async (req) => {
  // CORS headers
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
    const { messages, session_id, tenant_id, user_id } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages array');
    }

    // Initialize Supabase client
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // System prompt
    const systemMessage: Message = {
      role: 'system',
      content: \`You are Spatchy AI, the AI dispatch copilot for boutique, female-led trucking operations.

Your mission: Automate the mental load of dispatch so dispatchers can think like CEOs, not switchboards.

Your capabilities:
- Create and manage loads with full lifecycle tracking
- Assign drivers intelligently based on availability, location, and preferences
- Update load statuses and track operational flow
- Query drivers, loads, and operational data
- Propose lane utilization plans to maximize RPM
- Summarize daily operations for decision-making
- Draft communication (broker updates, driver messages) - coming soon

Your personality:
- Trustworthy and transparent (no hidden actions)
- Confident but empathetic
- Action-oriented with clear explanations
- Respectful of dispatcher boundaries and quiet hours

Guidelines:
- Always confirm critical details before creating loads
- Check driver availability and current status before assignments
- Prioritize high-value loads and efficient lane utilization
- Be concise - dispatchers are busy
- Use tools proactively to provide insights and recommendations
- When suggesting actions, explain the "why" behind your recommendation

Current context:
- Tenant ID: \${tenant_id}
- User ID: \${user_id}
- Session ID: \${session_id}\`,
    };

    const fullMessages = [systemMessage, ...messages];

    // Call LLM
    let response;
    if (ANTHROPIC_API_KEY) {
      response = await callClaude(fullMessages);
    } else {
      throw new Error('No AI provider configured');
    }

    // Check automation mode and paused status
    const automationMode = await checkAutomationMode(supabase, tenant_id);
    const { data: tenant } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', tenant_id)
      .single();
    
    const automationPaused = tenant?.settings?.automation_paused || false;
    
    // If automation is paused, force suggest_only mode
    const effectiveMode = automationPaused ? 'suggest_only' : automationMode;

    // Handle tool calls if present
    if (response.content && response.content.some((c: any) => c.type === 'tool_use')) {
      const toolResults = [];

      for (const content of response.content) {
        if (content.type === 'tool_use') {
          try {
            const result = await executeTool(
              content.name,
              content.input,
              supabase,
              tenant_id,
              user_id,
              effectiveMode
            );
            toolResults.push({
              tool_call_id: content.id,
              role: 'tool',
              content: JSON.stringify(result),
            });
          } catch (error: any) {
            toolResults.push({
              tool_call_id: content.id,
              role: 'tool',
              content: JSON.stringify({ error: error.message }),
            });
          }
        }
      }

      // Save messages to session
      if (session_id) {
        await supabase.from('messages').insert([
          {
            session_id,
            role: 'assistant',
            content: response.content,
          },
          ...toolResults.map((tr) => ({
            session_id,
            role: tr.role,
            content: tr.content,
          })),
        ]);
      }

      return new Response(
        JSON.stringify({
          success: true,
          response: response.content.find((c: any) => c.type === 'text')?.text || 'Tool executed',
          tool_results: toolResults,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Regular text response
    const textContent = response.content.find((c: any) => c.type === 'text')?.text || '';

    // Save message
    if (session_id) {
      await supabase.from('messages').insert({
        session_id,
        role: 'assistant',
        content: { text: textContent },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: textContent,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
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
