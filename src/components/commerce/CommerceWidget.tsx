import { useState, useRef, useEffect, useCallback } from "react";
import { ShoppingBag, X, Send, Loader2, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { 
  ShopifyProduct, 
  searchProducts as shopifySearch, 
  fetchProducts,
  formatPrice 
} from "@/lib/shopify";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: ShopifyProduct[];
};

const COMMERCE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/commerce-chat`;

export function CommerceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! 😊 I'm your Shopping Assistant. I can help you find products from our store. What are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore(state => state.addItem);
  const cartItems = useCartStore(state => state.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect if message is a product search request
  const isProductSearch = (text: string): boolean => {
    const searchIndicators = [
      "find", "search", "looking for", "buy", "want", "need",
      "show me", "where can i", "price", "best", "cheap",
      "affordable", "recommend", "suggestion", "options for",
      "products", "shirt", "clothing", "item", "shop"
    ];
    const lowerText = text.toLowerCase();
    return searchIndicators.some(indicator => lowerText.includes(indicator));
  };

  // Search for products using Shopify
  const searchProductsFromStore = async (query: string): Promise<ShopifyProduct[]> => {
    try {
      // First try search
      let products = await shopifySearch(query, 8);
      
      // If no results from search, fetch all products
      if (products.length === 0) {
        products = await fetchProducts(8);
      }
      
      return products;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) {
      toast.error("Product variant not available");
      return;
    }

    const cartItem: CartItem = {
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    };

    addItem(cartItem);
    toast.success(`${product.node.title} added to cart`, {
      position: "top-center",
    });
  };

  const streamChat = useCallback(async (
    userMessages: Message[], 
    searchResults?: ShopifyProduct[]
  ) => {
    // Create a context message for the AI about available products
    const productContext = searchResults && searchResults.length > 0 
      ? `\n\nI found these products in our store:\n${searchResults.map(p => 
          `- ${p.node.title}: ${formatPrice(p.node.priceRange.minVariantPrice.amount, p.node.priceRange.minVariantPrice.currencyCode)}`
        ).join('\n')}\n\nPlease help the customer with these products.`
      : '';

    const resp = await fetch(COMMERCE_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages.map(m => ({ 
          role: m.role, 
          content: m.role === 'user' ? m.content + productContext : m.content 
        })),
        searchResults: searchResults?.map(p => ({
          title: p.node.title,
          price: formatPrice(p.node.priceRange.minVariantPrice.amount, p.node.priceRange.minVariantPrice.currencyCode),
          description: p.node.description,
          url: `/product/${p.node.handle}`,
        })),
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
        throw new Error("Rate limited");
      }
      if (resp.status === 402) {
        toast.error("Service temporarily unavailable.");
        throw new Error("Payment required");
      }
      throw new Error("Failed to send message");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent, products: searchResults } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent, products: searchResults }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      let searchResults: ShopifyProduct[] = [];
      
      // Check if this looks like a product search
      if (isProductSearch(currentInput)) {
        setIsSearching(true);
        searchResults = await searchProductsFromStore(currentInput);
        setIsSearching(false);
      }

      await streamChat([...messages, userMessage], searchResults);
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof Error && !error.message.includes("Rate limited") && !error.message.includes("Payment required")) {
        toast.error("Failed to get response. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Product card for chat
  const ChatProductCard = ({ product }: { product: ShopifyProduct }) => {
    const { node } = product;
    const firstImage = node.images.edges[0]?.node;
    const price = node.priceRange.minVariantPrice;

    return (
      <Card className="overflow-hidden">
        <div className="flex gap-3 p-3">
          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {firstImage ? (
              <img
                src={firstImage.url}
                alt={firstImage.altText || node.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-1">{node.title}</h4>
            <p className="text-sm font-bold text-primary mt-0.5">
              {formatPrice(price.amount, price.currencyCode)}
            </p>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Link to={`/product/${node.handle}`}>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      {/* Commerce Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white",
          isOpen && "scale-0 opacity-0"
        )}
        size="icon"
      >
        <ShoppingBag className="h-6 w-6" />
      </Button>

      {/* Commerce Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 left-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300",
          "w-[380px] h-[550px]",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Shopping Assistant</h3>
              <p className="text-xs opacity-80">Find products from our store</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Cart indicator */}
            {totalCartItems > 0 && (
              <Link to="/shop">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-white text-pink-500">
                    {totalCartItems}
                  </Badge>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="space-y-3">
              <div
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <Heart className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {message.content}
                </div>
              </div>
              
              {/* Product Cards */}
              {message.role === "assistant" && message.products && message.products.length > 0 && (
                <div className="ml-11 space-y-2">
                  {message.products.slice(0, 4).map((product) => (
                    <ChatProductCard key={product.node.id} product={product} />
                  ))}
                  {message.products.length > 4 && (
                    <Link to="/shop">
                      <Button variant="outline" size="sm" className="w-full">
                        View all {message.products.length} products
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {isSearching && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm">
                Searching our store...
              </div>
            </div>
          )}
          
          {isLoading && !isSearching && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <Heart className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => {
                setInput("Show me your products");
                setTimeout(() => sendMessage(), 100);
              }}
            >
              Browse Products
            </Button>
            <Link to="/shop">
              <Button
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap"
              >
                Visit Shop
              </Button>
            </Link>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are you looking for?"
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
