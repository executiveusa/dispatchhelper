
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
    const { message, userId } = await req.json();
    
    // Validate input
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Store the message in a messages table (if it exists)
    try {
      await supabaseClient.from("chat_messages").insert({
        user_id: userId,
        content: message,
        role: "user",
      });
    } catch (error) {
      // Continue even if storage fails - this is not critical
      console.error("Error storing message:", error);
    }

    // For now, we'll implement a simple rule-based response system
    // In a production environment, you would integrate with OpenAI or another AI model
    let reply = "";

    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes("book") || lowercaseMessage.includes("schedule")) {
      reply = "I can help you book a ride! Please provide your pickup location, destination, and preferred time.";
    } else if (lowercaseMessage.includes("cancel")) {
      reply = "To cancel a booking, please provide your booking reference number.";
    } else if (lowercaseMessage.includes("driver") || lowercaseMessage.includes("where")) {
      reply = "I can check the status of your driver. What's your booking reference number?";
    } else if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
      reply = "Hello! How can I assist with your transportation needs today?";
    } else if (lowercaseMessage.includes("help")) {
      reply = "I can help with booking rides, checking driver status, cancelling bookings, and answering questions about our services.";
    } else {
      reply = "I'm not sure how to respond to that. Would you like to book a ride, check on a driver, or cancel a booking?";
    }

    // Store the assistant's reply
    try {
      await supabaseClient.from("chat_messages").insert({
        user_id: userId,
        content: reply,
        role: "assistant",
      });
    } catch (error) {
      // Continue even if storage fails
      console.error("Error storing assistant reply:", error);
    }

    return new Response(
      JSON.stringify({ reply }),
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
