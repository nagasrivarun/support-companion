import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type WebhookType = 
  | "order_notification" 
  | "customer_support" 
  | "abandoned_cart" 
  | "product_recommendation" 
  | "review_request";

interface TriggerRequest {
  type: WebhookType;
  payload: Record<string, unknown>;
}

async function triggerMakeWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    console.log("Triggering Make.com webhook:", webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: "lovable-ecommerce",
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Make.com webhook error:", response.status, responseText);
      return { success: false, error: `HTTP ${response.status}: ${responseText}` };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    console.log("Make.com webhook success:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Make.com webhook exception:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: TriggerRequest = await req.json();
    const { type, payload } = body;

    // Validate webhook type
    const validTypes: WebhookType[] = [
      "order_notification",
      "customer_support",
      "abandoned_cart",
      "product_recommendation",
      "review_request",
    ];

    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active webhook configuration
    const { data: webhook, error: webhookError } = await supabase
      .from("automation_webhooks")
      .select("*")
      .eq("webhook_type", type)
      .eq("is_active", true)
      .maybeSingle();

    if (webhookError) {
      console.error("Error fetching webhook:", webhookError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch webhook configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhook) {
      console.log("No active webhook found for type:", type);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `No active webhook configured for ${type}` 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger the Make.com webhook
    const result = await triggerMakeWebhook(webhook.webhook_url, payload);

    // Log the automation attempt
    await supabase.from("automation_logs").insert({
      webhook_id: webhook.id,
      event_type: type,
      payload,
      status: result.success ? "success" : "failed",
      response_data: result.data ? { data: result.data } : null,
      error_message: result.error || null,
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.success 
          ? `${type} automation triggered successfully`
          : `Failed to trigger ${type} automation`,
        error: result.error,
      }),
      { 
        status: result.success ? 200 : 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Make automation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
