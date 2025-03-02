
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.34.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { audioData, userId } = await req.json();
    
    if (!audioData) {
      return new Response(
        JSON.stringify({ error: "Audio data is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // In a real implementation, you would:
    // 1. Process the audio data using a service like Whisper API
    // 2. Store the audio file in Supabase Storage
    // 3. Return the transcription

    // For this demo, we'll return a mock transcription
    const mockTranscription = "This is a simulated transcription of the voice input.";

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Store the transcription
    try {
      await supabaseClient.from("voice_transcriptions").insert({
        user_id: userId,
        transcription: mockTranscription
      });
    } catch (error) {
      console.error("Error storing transcription:", error);
    }

    return new Response(
      JSON.stringify({ 
        text: mockTranscription,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
