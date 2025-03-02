
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestData {
  message: string;
  userId: string;
  language?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the OpenAI API key from environment variable
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the request body
    const data: RequestData = await req.json();
    const { message, userId, language = 'en' } = data;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing dispatch message from user ${userId}: ${message} in language: ${language}`);

    // Create a Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    // Store the user message in the database
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: message,
        role: 'user',
      });

    if (insertError) {
      console.error('Error storing user message:', insertError);
    }

    // Prepare system message depending on language
    let systemPrompt = '';
    switch(language) {
      case 'es':
        systemPrompt = 'Eres un asistente de despacho de IA para un servicio de transporte. Ayudas a los usuarios a reservar viajes, verificar el estado de los viajes y responder preguntas. Mantén las respuestas concisas y útiles. Responde en español.';
        break;
      case 'fr':
        systemPrompt = 'Vous êtes un assistant de répartition IA pour un service de transport. Vous aidez les utilisateurs à réserver des trajets, à vérifier l\'état des trajets et à répondre aux questions. Gardez les réponses concises et utiles. Répondez en français.';
        break;
      case 'de':
        systemPrompt = 'Sie sind ein KI-Versandassistent für einen Transportdienst. Sie helfen Benutzern bei der Buchung von Fahrten, der Überprüfung des Fahrstatus und der Beantwortung von Fragen. Halten Sie die Antworten prägnant und hilfreich. Antworten Sie auf Deutsch.';
        break;
      default: // English
        systemPrompt = 'You are an AI dispatch assistant for a transportation service. You help users book rides, check ride status, and answer questions. Keep responses concise and helpful. Respond in English.';
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const reply = result.choices[0].message.content;

    // Store the assistant's reply in the database
    const { error: replyError } = await supabase
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

// Helper function to create a Supabase client
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
