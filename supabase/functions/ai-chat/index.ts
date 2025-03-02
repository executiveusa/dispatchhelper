
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// This creates a Supabase client with the service role key (full admin access)
const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseKey);

interface RequestData {
  message: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const data: RequestData = await req.json();
    const { message, userId } = data;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message from user ${userId}: ${message}`);

    // Store the user message in the database
    const { error: insertError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: message,
        role: 'user',
      });

    if (insertError) {
      console.error('Error storing user message:', insertError);
    }

    // Process the message and generate a reply
    // This is a simple implementation - in a production system, you'd likely 
    // integrate with a more sophisticated AI model like OpenAI
    let reply = '';
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('book') || lowercaseMessage.includes('reservation')) {
      reply = "I can help you book a ride! Please provide your pickup location, destination, and preferred time.";
    } else if (lowercaseMessage.includes('cancel')) {
      reply = "I can help you cancel a booking. Please provide your booking reference number.";
    } else if (lowercaseMessage.includes('status') || lowercaseMessage.includes('where')) {
      reply = "I can check the status of your booking for you. Can you provide your booking reference or the date and time of your reservation?";
    } else if (lowercaseMessage.includes('cost') || lowercaseMessage.includes('price') || lowercaseMessage.includes('fare')) {
      reply = "Our pricing depends on distance, time, and vehicle type. If you provide your trip details, I can give you an estimate.";
    } else if (lowercaseMessage.includes('vehicle') || lowercaseMessage.includes('car') || lowercaseMessage.includes('limo')) {
      reply = "We offer sedans, SUVs, luxury vehicles, and limousines. Which type of vehicle would you prefer?";
    } else {
      reply = "Thank you for your message. How can I assist you with your transportation needs today?";
    }

    // Store the assistant's reply in the database
    const { error: replyError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: reply,
        role: 'assistant',
      });

    if (replyError) {
      console.error('Error storing assistant reply:', replyError);
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to create a Supabase client (simplified version)
function createSupabaseClient(supabaseUrl: string, supabaseKey: string) {
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  };
  
  return {
    from: (table: string) => ({
      insert: async (data: any) => {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData };
          }
          
          return { data: await response.json(), error: null };
        } catch (error) {
          return { error };
        }
      },
      select: (columns: string) => ({
        eq: async (column: string, value: any) => {
          try {
            const response = await fetch(
              `${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}`,
              { headers }
            );
            
            if (!response.ok) {
              const errorData = await response.json();
              return { error: errorData };
            }
            
            return { data: await response.json(), error: null };
          } catch (error) {
            return { error };
          }
        }
      })
    })
  };
}
