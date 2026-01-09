import { useState, useRef, useEffect, useCallback } from "react";
import { ShoppingBag, X, Send, Loader2, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Product = {
  title: string;
  price: string;
  description: string;
  platform: string;
  url: string;
};

const COMMERCE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/commerce-chat`;
const COMMERCE_SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/commerce-search`;

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const streamChat = useCallback(async (userMessages: Message[], searchResults?: Product[]) => {
    const resp = await fetch(COMMERCE_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
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
              return [...prev, { role: "assistant", content: assistantContent }];
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
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
