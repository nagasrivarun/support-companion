import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("=== MOCK WEBHOOK RECEIVED ===");
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const { type, data } = payload;

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate mock AI responses based on type
    let aiResponse: Record<string, unknown> = {};

    switch (type) {
      case "order_notification":
        aiResponse = {
          success: true,
          message: `Order ${data?.order?.orderNumber} notification processed`,
          generatedEmail: {
            subject: `Thank you for your order ${data?.order?.orderNumber}!`,
            body: `Dear ${data?.order?.customerName},\n\nThank you for your order! Your order ${data?.order?.orderNumber} for $${data?.order?.totalAmount} has been received and is being processed.\n\nItems ordered:\n${data?.order?.items?.map((i: { name: string; quantity: number }) => `- ${i.name} x${i.quantity}`).join('\n')}\n\nWe'll notify you when it ships!\n\nBest regards,\nThe Team`,
          },
        };
        break;

      case "customer_support":
        aiResponse = {
          success: true,
          message: "Support ticket created and AI response generated",
          ticketId: `TKT-${Date.now()}`,
          aiSuggestedResponse: `Hello ${data?.ticket?.customerName || "there"},\n\nThank you for reaching out! I understand you're asking about: "${data?.ticket?.message}"\n\nI'm looking into this for you and will get back to you shortly with a detailed response.\n\nBest regards,\nSupport Team`,
          category: data?.ticket?.category || "general",
          priority: "medium",
        };
        break;

      case "abandoned_cart":
        aiResponse = {
          success: true,
          message: "Abandoned cart recovery email queued",
          generatedEmail: {
            subject: "You left something behind! 🛒",
            body: `Hi there!\n\nWe noticed you left some amazing items in your cart worth $${data?.cart?.totalAmount}.\n\nItems in your cart:\n${data?.cart?.items?.map((i: { title: string; price: number }) => `- ${i.title} ($${i.price})`).join('\n')}\n\n👉 Complete your order here: ${data?.cart?.cartUrl}\n\nAs a special offer, use code COMEBACK10 for 10% off!\n\nHurry - your cart is waiting!`,
          },
          discountCode: "COMEBACK10",
          discountAmount: "10%",
        };
        break;

      case "product_recommendation":
        aiResponse = {
          success: true,
          message: "Personalized recommendations generated",
          recommendations: [
            { productId: "rec-1", title: "Premium Wireless Headphones", reason: "Based on your interest in electronics" },
            { productId: "rec-2", title: "Leather Laptop Bag", reason: "Complements your recent purchases" },
            { productId: "rec-3", title: "Smart Watch Pro", reason: "Trending in your preferred category" },
          ],
          generatedEmail: {
            subject: "Handpicked just for you! ✨",
            body: `Hi ${data?.customer?.customerEmail?.split('@')[0] || "there"}!\n\nBased on your browsing history and preferences, we think you'll love these:\n\n1. Premium Wireless Headphones\n2. Leather Laptop Bag\n3. Smart Watch Pro\n\nCheck them out today!`,
          },
        };
        break;

      case "review_request":
        aiResponse = {
          success: true,
          message: "Review request email scheduled",
          generatedEmail: {
            subject: `How was your order ${data?.order?.orderNumber}? ⭐`,
            body: `Hi ${data?.order?.customerName}!\n\nWe hope you're enjoying your recent purchase!\n\nProducts you ordered:\n${data?.order?.products?.map((p: { title: string }) => `- ${p.title}`).join('\n')}\n\nWe'd love to hear your feedback! Leave a review and help other customers make informed decisions.\n\n[Leave a Review]\n\nThank you for shopping with us!`,
          },
          scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        };
        break;

      default:
        aiResponse = {
          success: true,
          message: `Unknown automation type: ${type}`,
          receivedPayload: data,
        };
    }

    console.log("=== MOCK AI RESPONSE ===");
    console.log(JSON.stringify(aiResponse, null, 2));

    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Mock webhook error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
