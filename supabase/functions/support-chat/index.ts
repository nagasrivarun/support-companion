import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Regex to match order numbers like ORD-20250106-1234
const ORDER_ID_REGEX = /\bORD-\d{8}-\d{4}\b/gi;

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
- When you receive order information from the system, use it to answer the customer's questions accurately

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
  "live agent",
  "human agent",
  "connect me",
  "talk to someone",
];

function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pending - Your order is being processed",
    processing: "Processing - Your order is being prepared",
    shipped: "Shipped - Your order is on its way",
    delivered: "Delivered - Your order has been delivered",
    cancelled: "Cancelled - This order has been cancelled",
  };
  return statusMap[status] || status;
}

function formatOrderDetails(order: any): string {
  const items = order.items || [];
  const itemsList = items.map((item: any) => `- ${item.name} (Qty: ${item.quantity})`).join("\n");
  
  return `
ORDER INFORMATION (use this to answer the customer):
- Order Number: ${order.order_number}
- Status: ${formatOrderStatus(order.status)}
- Total Amount: $${Number(order.total_amount).toFixed(2)}
- Order Date: ${new Date(order.created_at).toLocaleDateString()}
- Customer Name: ${order.customer_name}
${order.shipping_address ? `- Shipping Address: ${order.shipping_address}` : ""}
${itemsList ? `\nItems:\n${itemsList}` : ""}
${order.notes ? `\nNotes: ${order.notes}` : ""}
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, customerName, customerEmail } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get or create conversation
    let activeConversationId = conversationId;
    
    if (!activeConversationId) {
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          customer_name: customerName || "Website Visitor",
          customer_email: customerEmail || null,
          status: "bot",
          last_message: messages[messages.length - 1]?.content || "",
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating conversation:", createError);
        throw new Error("Failed to create conversation");
      }
      
      activeConversationId = newConversation.id;
      console.log("Created new conversation:", activeConversationId);
    } else if (customerEmail) {
      // Update email if provided
      await supabase
        .from("conversations")
        .update({ customer_email: customerEmail })
        .eq("id", activeConversationId);
    }

    // Save the user message
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    if (lastUserMessage) {
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: activeConversationId,
        content: lastUserMessage.content,
        sender_type: "customer",
      });

      if (msgError) {
        console.error("Error saving user message:", msgError);
      }

      await supabase
        .from("conversations")
        .update({ 
          last_message: lastUserMessage.content,
          updated_at: new Date().toISOString(),
          unread_count: 1,
        })
        .eq("id", activeConversationId);
    }

    // Check for escalation triggers
    const shouldEscalate = lastUserMessage && ESCALATION_TRIGGERS.some(
      trigger => lastUserMessage.content.toLowerCase().includes(trigger)
    );

    if (shouldEscalate) {
      const escalationMessage = "I understand you'd like to speak with a human agent. I'm connecting you now. A team member will be with you shortly.";
      
      await supabase.from("messages").insert({
        conversation_id: activeConversationId,
        content: escalationMessage,
        sender_type: "bot",
      });

      // Update status to 'waiting' for human agent
      await supabase
        .from("conversations")
        .update({ 
          status: "waiting",
          last_message: escalationMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeConversationId);

      console.log("Escalated conversation:", activeConversationId);

      return new Response(JSON.stringify({
        type: "escalation",
        message: escalationMessage,
        conversationId: activeConversationId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for order IDs in the last user message
    let orderContext = "";
    if (lastUserMessage) {
      const orderIds = lastUserMessage.content.match(ORDER_ID_REGEX);
      
      if (orderIds && orderIds.length > 0) {
        console.log("Found order IDs:", orderIds);
        
        // Query the orders table
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .in("order_number", orderIds.map((id: string) => id.toUpperCase()));

        if (orderError) {
          console.error("Error fetching orders:", orderError);
        } else if (orders && orders.length > 0) {
          console.log("Found orders:", orders.length);
          orderContext = orders.map(formatOrderDetails).join("\n---\n");
        } else {
          orderContext = `\nSYSTEM NOTE: No orders found matching the provided order number(s): ${orderIds.join(", ")}. Please inform the customer politely that the order was not found and ask them to verify the order number.`;
        }
      }
    }

    // Build messages for AI with order context
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT + (orderContext ? `\n\n${orderContext}` : "") },
      ...messages,
    ];

    // Get AI response
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
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

    // Create a transform stream to capture the full response while streaming
    let fullResponse = "";
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line.slice(6).trim() !== "[DONE]") {
            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
              }
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
        
        controller.enqueue(chunk);
      },
      async flush() {
        if (fullResponse && activeConversationId) {
          await supabase.from("messages").insert({
            conversation_id: activeConversationId,
            content: fullResponse,
            sender_type: "bot",
          });

          await supabase
            .from("conversations")
            .update({ 
              last_message: fullResponse.slice(0, 200),
              updated_at: new Date().toISOString(),
              unread_count: 0,
            })
            .eq("id", activeConversationId);
        }
      },
    });

    const streamedResponse = response.body?.pipeThrough(transformStream);

    const responseHeaders = {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "X-Conversation-Id": activeConversationId,
    };

    return new Response(streamedResponse, { headers: responseHeaders });
  } catch (error) {
    console.error("Support chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
