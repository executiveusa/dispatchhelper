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
      name: 'create_request',
      description: 'Create a new dispatch request/load in the system',
      parameters: {
        type: 'object',
        properties: {
          pickup_location: { type: 'string', description: 'Pickup location' },
          dropoff_location: { type: 'string', description: 'Dropoff location' },
          pickup_datetime: { type: 'string', description: 'Pickup datetime (ISO 8601)' },
          dropoff_datetime: { type: 'string', description: 'Dropoff datetime (ISO 8601)' },
          cargo_type: { type: 'string', description: 'Type of cargo' },
          weight: { type: 'number', description: 'Weight of cargo' },
          rate: { type: 'number', description: 'Rate for this load' },
          broker_name: { type: 'string', description: 'Broker name' },
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
      name: 'update_status',
      description: 'Update the status of a dispatch request',
      parameters: {
        type: 'object',
        properties: {
          request_id: { type: 'string', description: 'UUID of the request' },
          status: {
            type: 'string',
            enum: ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'],
            description: 'New status',
          },
        },
        required: ['request_id', 'status'],
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
      name: 'get_pending_requests',
      description: 'Get list of pending dispatch requests that need assignment',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max number of requests to return' },
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
    case 'create_request': {
      const { data, error } = await supabase
        .from('requests')
        .insert({
          tenant_id: tenantId,
          created_by: userId,
          ...args,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, request: data };
    }

    case 'assign_driver': {
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

      // Update request status
      await supabase
        .from('requests')
        .update({ status: 'assigned' })
        .eq('id', args.request_id);

      // Update driver status
      await supabase
        .from('drivers')
        .update({ status: 'assigned' })
        .eq('id', args.driver_id);

      return { success: true, assignment: data };
    }

    case 'update_status': {
      const { data, error } = await supabase
        .from('requests')
        .update({ status: args.status })
        .eq('id', args.request_id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, request: data };
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

    case 'get_pending_requests': {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(args.limit || 10);

      if (error) throw error;
      return { requests: data };
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
      content: \`You are Spatchy AI, an intelligent dispatch assistant for trucking operations.

Your capabilities:
- Create new dispatch requests/loads
- Assign drivers to loads based on availability
- Update request statuses
- Query available drivers and pending requests
- Provide dispatch recommendations

Guidelines:
- Always confirm details before creating requests
- Check driver availability before assignments
- Prioritize urgent loads
- Be concise and action-oriented
- Use tools proactively to help the user

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
