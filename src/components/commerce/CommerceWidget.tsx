import { useState, useRef, useEffect, useCallback } from "react";
import { ShoppingBag, X, Send, Loader2, Heart, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  ProductGrid, 
  ProductComparison, 
  WishlistPanel, 
  type Product, 
  type PriceAlert,
  extractPrice,
  loadPriceAlerts,
  savePriceAlerts 
} from "./ProductCard";

const WISHLIST_STORAGE_KEY = "commerce-wishlist";

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
};

type PriceDrop = {
  product: Product;
  oldPrice: number;
  newPrice: number;
};

const COMMERCE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/commerce-chat`;
const COMMERCE_SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/commerce-search`;

// Load wishlist from localStorage
const loadWishlist = (): Product[] => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save wishlist to localStorage
const saveWishlist = (products: Product[]) => {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error("Failed to save wishlist:", e);
  }
};

export function CommerceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! 😊 I'm your Lovable Shopping Assistant. I'm here to help you find the perfect products across Amazon, Walmart, eBay, and more. What are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>(loadWishlist);
  const [showWishlist, setShowWishlist] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(loadPriceAlerts);
  const [priceDrops, setPriceDrops] = useState<PriceDrop[]>([]);
  const [hasNewAlerts, setHasNewAlerts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist wishlist to localStorage when it changes
  useEffect(() => {
    saveWishlist(wishlist);
  }, [wishlist]);

  // Persist price alerts to localStorage when they change
  useEffect(() => {
    savePriceAlerts(priceAlerts);
  }, [priceAlerts]);

  // Simulate price check on widget open (in real app, this would be a backend job)
  useEffect(() => {
    if (isOpen && priceAlerts.length > 0 && wishlist.length > 0) {
      // Simulate checking for price drops (10% chance per alert for demo)
      const drops: PriceDrop[] = [];
      
      priceAlerts.forEach(alert => {
        const product = wishlist.find(p => p.url === alert.productUrl);
        if (product) {
          // Simulate a random price drop for demo purposes
          const currentPrice = extractPrice(product.price);
          if (Math.random() < 0.1 && currentPrice > alert.targetPrice) {
            // Simulate price dropped to or below target
            const newPrice = alert.targetPrice * (0.95 + Math.random() * 0.05);
            drops.push({
              product: { ...product, price: `$${newPrice.toFixed(2)}` },
              oldPrice: currentPrice,
              newPrice
            });
          }
        }
      });

      if (drops.length > 0) {
        setPriceDrops(drops);
        setHasNewAlerts(true);
        toast({
          title: "🎉 Price Drop Alert!",
          description: `${drops.length} item${drops.length > 1 ? 's' : ''} on your wishlist dropped in price!`,
        });
      }
    }
  }, [isOpen]);

  // Set a price alert
  const handleSetPriceAlert = useCallback((product: Product, targetPrice: number) => {
    const currentPrice = extractPrice(product.price);
    
    setPriceAlerts(prev => {
      // Remove any existing alert for this product
      const filtered = prev.filter(a => a.productUrl !== product.url);
      
      return [...filtered, {
        productUrl: product.url,
        targetPrice,
        originalPrice: currentPrice,
        createdAt: new Date().toISOString()
      }];
    });
    
    toast({
      title: "Price Alert Set! 🔔",
      description: `We'll notify you when ${product.title.slice(0, 30)}... drops below $${targetPrice.toFixed(2)}`,
    });
  }, [toast]);

  // Remove a price alert
  const handleRemovePriceAlert = useCallback((productUrl: string) => {
    setPriceAlerts(prev => prev.filter(a => a.productUrl !== productUrl));
    toast({
      title: "Alert Removed",
      description: "Price alert has been removed.",
    });
  }, [toast]);

  // Detect if message is a product search request
  const isProductSearch = (text: string): boolean => {
    const searchIndicators = [
      "find", "search", "looking for", "buy", "want", "need",
      "show me", "where can i", "price", "best", "cheap",
      "affordable", "recommend", "suggestion", "options for"
    ];
    const lowerText = text.toLowerCase();
    return searchIndicators.some(indicator => lowerText.includes(indicator));
  };

  // Search for products
  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      const response = await fetch(COMMERCE_SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error("Search failed:", response.status);
        return [];
      }

      const data = await response.json();
      return data.success ? data.products : [];
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  };

  // Toggle product in comparison list
  const handleToggleCompare = useCallback((product: Product) => {
    setCompareProducts(prev => {
      const exists = prev.some(p => p.url === product.url);
      if (exists) {
        return prev.filter(p => p.url !== product.url);
      }
      if (prev.length >= 4) {
        toast({
          title: "Limit Reached",
          description: "You can compare up to 4 products at a time.",
        });
        return prev;
      }
      return [...prev, product];
    });
  }, [toast]);

  // Remove product from comparison
  const handleRemoveFromComparison = useCallback((product: Product) => {
    setCompareProducts(prev => prev.filter(p => p.url !== product.url));
  }, []);

  // Toggle product in wishlist
  const handleToggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.url === product.url);
      if (exists) {
        toast({
          title: "Removed from Wishlist",
          description: "Product removed from your wishlist.",
        });
        return prev.filter(p => p.url !== product.url);
      }
      toast({
        title: "Added to Wishlist",
        description: "Product saved to your wishlist! ❤️",
      });
      return [...prev, product];
    });
  }, [toast]);

  // Remove product from wishlist
  const handleRemoveFromWishlist = useCallback((product: Product) => {
    setWishlist(prev => prev.filter(p => p.url !== product.url));
  }, []);

  const streamChat = useCallback(async (
    userMessages: Message[], 
    searchResults?: Product[],
    onProductsFound?: (products: Product[]) => void
  ) => {
    const resp = await fetch(COMMERCE_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        searchResults,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        toast({
          variant: "destructive",
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment.",
        });
        throw new Error("Rate limited");
      }
      if (resp.status === 402) {
        toast({
          variant: "destructive",
          title: "Service Unavailable",
          description: "Service temporarily unavailable.",
        });
        throw new Error("Payment required");
      }
      throw new Error("Failed to send message");
    }

    if (!resp.body) throw new Error("No response body");

    // If we have products, notify the callback
    if (searchResults && searchResults.length > 0 && onProductsFound) {
      onProductsFound(searchResults);
    }

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
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
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
  }, [toast]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    // Clear comparison when new search starts
    setCompareProducts([]);

    try {
      let searchResults: Product[] = [];
      
      // Check if this looks like a product search
      if (isProductSearch(currentInput)) {
        setIsSearching(true);
        searchResults = await searchProducts(currentInput);
        setIsSearching(false);
      }

      await streamChat([...messages, userMessage], searchResults);
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof Error && !error.message.includes("Rate limited") && !error.message.includes("Payment required")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get response. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Product Comparison Modal */}
      {showComparison && compareProducts.length >= 2 && (
        <ProductComparison
          products={compareProducts}
          onClose={() => setShowComparison(false)}
          onRemove={handleRemoveFromComparison}
        />
      )}

      {/* Wishlist Panel */}
      {showWishlist && (
        <WishlistPanel
          products={wishlist}
          onClose={() => {
            setShowWishlist(false);
            setHasNewAlerts(false);
          }}
          onRemove={handleRemoveFromWishlist}
          priceAlerts={priceAlerts}
          onSetAlert={handleSetPriceAlert}
          onRemoveAlert={handleRemovePriceAlert}
          priceDrops={priceDrops}
        />
      )}

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
          "w-[400px] h-[600px]",
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
              <p className="text-xs opacity-80">Find anything, anywhere 😊</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowWishlist(true)}
              className="text-white hover:bg-white/20 relative"
            >
              <Heart className={cn("h-5 w-5", wishlist.length > 0 && "fill-current")} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white text-pink-500 text-xs font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
              {hasNewAlerts && (
                <span className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              )}
            </Button>
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
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {message.content}
                </div>
              </div>
              
              {/* Product Cards with filters and comparison */}
              {message.role === "assistant" && message.products && message.products.length > 0 && (
                <div className="ml-11">
                  <ProductGrid 
                    products={message.products}
                    compareProducts={compareProducts}
                    onToggleCompare={handleToggleCompare}
                    onOpenComparison={() => setShowComparison(true)}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                  />
                </div>
              )}
            </div>
          ))}
          
          {/* Searching Indicator */}
          {isSearching && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <Search className="h-4 w-4 animate-pulse" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-muted-foreground">
                Searching across e-commerce platforms...
              </div>
            </div>
          )}
          
          {/* Loading Indicator */}
          {isLoading && !isSearching && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <Heart className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border px-3 py-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["Laptop deals", "Gift ideas", "Best headphones", "Under $50"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
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
              placeholder="What are you looking for? 😊"
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
