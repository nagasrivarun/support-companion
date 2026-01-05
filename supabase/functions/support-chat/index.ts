import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are SupportBot, a professional customer support assistant for an online retail store.

PRIMARY GOAL:
Help users with store-related queries such as orders, returns, payments, delivery, and account issues.

STRICT RULES:
- Be polite, calm, and concise
- Ask clarifying questions if the request is ambiguous
- NEVER guess order status, delivery dates, or payment details
- NEVER fabricate information
- NEVER answer questions unrelated to this store or its services
- NEVER provide coding, medical, legal, or general knowledge answers
- If required data (like order ID) is missing, request it clearly
- If confidence is low or the issue is complex, escalate to a human agent

ALLOWED TOPICS:
- Order tracking (only after receiving order ID)
- Return and refund policy
- Shipping and delivery information
- Account and login help
- Store hours and contact information

DISALLOWED TOPICS:
- General knowledge questions
- Programming or coding help
- Internet or current events
- Personal opinions

ESCALATION RULE:
If the request cannot be resolved safely and accurately, politely inform the user and transfer to a human agent.

RESPONSE STYLE:
- Friendly and professional
- Short, clear sentences
- No technical jargon
- Step-by-step guidance when necessary`;

const ESCALATION_TRIGGERS = [
  "speak to human",
  "talk to agent",
  "real person",
  "escalate",
  "supervisor",
  "manager",
  "complaint",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check for escalation triggers in the latest user message
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const shouldEscalate = lastUserMessage && ESCALATION_TRIGGERS.some(
      trigger => lastUserMessage.content.toLowerCase().includes(trigger)
    );

    if (shouldEscalate) {
      const escalationResponse = JSON.stringify({
        type: "escalation",
        message: "I understand you'd like to speak with a human agent. Let me connect you with one of our team members who can assist you further.",
      });
      
      return new Response(escalationResponse, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Support chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
