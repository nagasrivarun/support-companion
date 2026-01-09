import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductResult {
  title: string;
  price: string;
  description: string;
  platform: string;
  url: string;
  image?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, platforms } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Search service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search query targeting e-commerce sites
    const platformFilters = platforms?.length > 0 
      ? platforms.map((p: string) => `site:${p.toLowerCase()}.com`).join(" OR ")
      : "site:amazon.com OR site:walmart.com OR site:ebay.com OR site:target.com OR site:bestbuy.com OR site:etsy.com";
    
    const searchQuery = `${query} ${platformFilters} buy price`;

    console.log("Searching for products:", searchQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        lang: "en",
        country: "US",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl API error:", data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || "Search failed" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform search results into product format
    const products: ProductResult[] = (data.data || []).map((item: any) => {
      // Detect platform from URL
      let platform = "Online Store";
      const url = item.url?.toLowerCase() || "";
      if (url.includes("amazon")) platform = "Amazon";
      else if (url.includes("walmart")) platform = "Walmart";
      else if (url.includes("ebay")) platform = "eBay";
      else if (url.includes("target")) platform = "Target";
      else if (url.includes("bestbuy")) platform = "Best Buy";
      else if (url.includes("etsy")) platform = "Etsy";
      else if (url.includes("flipkart")) platform = "Flipkart";
      else if (url.includes("aliexpress")) platform = "AliExpress";

      // Extract price from description if possible (basic regex)
      let price = "";
      const priceMatch = (item.description || "").match(/\$[\d,]+\.?\d*/);
      if (priceMatch) {
        price = priceMatch[0];
      }

      return {
        title: item.title || "Product",
        price,
        description: item.description || "Click to view details",
        platform,
        url: item.url || "#",
      };
    }).filter((p: ProductResult) => 
      // Filter to only include results from known e-commerce platforms
      ["Amazon", "Walmart", "eBay", "Target", "Best Buy", "Etsy", "Flipkart", "AliExpress"].includes(p.platform)
    );

    console.log(`Found ${products.length} products`);

    return new Response(
      JSON.stringify({ success: true, products }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error searching products:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Search failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
