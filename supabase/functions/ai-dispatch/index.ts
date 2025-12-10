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
      description: 'Assign a driver to a dispatch request',
      parameters: {
        type: 'object',
        properties: {
          request_id: { type: 'string', description: 'UUID of the request' },
          driver_id: { type: 'string', description: 'UUID of the driver' },
          notes: { type: 'string', description: 'Assignment notes' },
        },
        required: ['request_id', 'driver_id'],
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

// Tool execution handlers
async function executeTool(
  toolName: string,
  args: any,
  supabase: any,
  tenantId: string,
  userId: string
): Promise<any> {
  console.log(\`Executing tool: \${toolName}\`, args);

  switch (toolName) {
    case 'create_load': {
      const { data, error } = await supabase
        .from('loads')
        .insert({
          tenant_id: tenantId,
          created_by: userId,
          ...args,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, load: data };
    }

    case 'assign_driver': {
      // Update load with driver assignment
      const { data: loadData, error: loadError } = await supabase
        .from('loads')
        .update({ 
          driver_id: args.driver_id,
          status: 'booked'
        })
        .eq('id', args.request_id)
        .select()
        .single();

      if (loadError) throw loadError;

      // Create assignment record
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          request_id: args.request_id,
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
        .eq('id', args.driver_id);

      return { success: true, assignment: data, load: loadData };
    }

    case 'update_load_status': {
      const { data, error } = await supabase
        .from('loads')
        .update({ status: args.status })
        .eq('id', args.load_id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, load: data };
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
              user_id
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
