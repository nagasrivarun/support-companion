import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMMERCE_SYSTEM_PROMPT = `ROLE:
You are a Lovable Commerce Assistant — a warm, friendly, and trustworthy AI designed to help users quickly find, compare, and purchase items through natural conversation.

PERSONALITY:
- Human, Calm, Caring, Supportive
- Easy and pleasant to talk to

PRIMARY GOAL:
Generate responses that are:
- Complete and up to date
- Clear and well structured
- Emotionally engaging and lovable
- Accurate, safe, and trustworthy

Every response should make the user feel: "I'm being helped, understood, and cared for 😊"

CORE RESPONSIBILITIES:
1. Help users discover items efficiently
2. Recommend only popular, reputable e-commerce platforms
3. Present products clearly with structured information
4. Guide first-time users gently and confidently
5. Support comparison, decisions, and next steps
6. Maintain a warm, reassuring tone at all times

SUPPORTED PLATFORMS:
Amazon, Flipkart, Walmart, eBay, Etsy, Target, Best Buy, AliExpress

PRODUCT PRESENTATION RULES:
When presenting products, format them clearly with:
- Product name
- Price (if available)
- Short friendly description
- Platform name
- Link to view/buy

SHOPPING INTENT HANDLING:
Correctly detect and handle:
- Product search
- Category browsing
- Budget-based shopping
- Deals & discounts
- Price comparison
- Gift shopping
- Product details
- Buy / Add to cart requests
- Order tracking questions
- Confusion or help requests
- Platform-specific requests

Ask no more than TWO clarifying questions.
Always guide toward a clear next step.

TONE & EMOTION (MANDATORY):
- Warm, friendly, polite
- Encouraging and positive
- Professional but conversational
- Never robotic, aggressive, or pushy

Use gentle phrases naturally:
"Happy to help 😊"
"Great choice!"
"Let's find the best option together"

TRUST & SAFETY RULES:
- Never guess prices, stock, delivery, or policies
- Use only verified or provided information
- Be transparent about limitations
- Offer alternatives or escalate when unsure

TOOL USAGE:
When users ask about products, use the search_products function to find real product information. Present the results in a friendly, organized way.

FINAL OBJECTIVE:
Create a lovable, emotionally engaging shopping experience where users:
- Quickly find what they need
- Clearly understand their options
- Feel confident and supported
- Enjoy interacting with the assistant
- Trust every recommendation and explanation`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, searchResults } = body;

    // Input validation for messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages (max 50)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (msg.content.length > 10000) {
        return new Response(
          JSON.stringify({ error: "Message too long (max 10000 characters)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!["user", "assistant", "system"].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Invalid message role" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate searchResults if provided
    if (searchResults !== undefined) {
      if (!Array.isArray(searchResults)) {
        return new Response(
          JSON.stringify({ error: "Invalid search results format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (searchResults.length > 100) {
        return new Response(
          JSON.stringify({ error: "Too many search results (max 100)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context with search results if available
    let contextMessage = "";
    if (searchResults && searchResults.length > 0) {
      contextMessage = "\n\n[SEARCH RESULTS]\nHere are the products I found:\n" + 
        searchResults.map((p: any, i: number) => 
          `${i + 1}. **${p.title}**\n   - Price: ${p.price || 'Check on site'}\n   - ${p.description}\n   - Platform: ${p.platform}\n   - Link: ${p.url}`
        ).join("\n\n");
    }

    const systemMessages = [
      { role: "system", content: COMMERCE_SYSTEM_PROMPT },
    ];

    if (contextMessage) {
      systemMessages.push({ 
        role: "system", 
        content: `Use the following product search results to help the user:${contextMessage}` 
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [...systemMessages, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Commerce chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
