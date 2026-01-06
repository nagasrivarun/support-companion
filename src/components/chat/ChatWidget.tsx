import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, UserRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatState = "email_collection" | "chatting" | "escalated";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>("email_collection");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to real-time messages when escalated
  useEffect(() => {
    if (!conversationId || chatState !== "escalated") return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as { sender_type: string; content: string };
          if (newMessage.sender_type === "agent") {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: newMessage.content },
            ]);
            setWaitingForAgent(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, chatState]);

  const startChat = () => {
    const name = customerName.trim() || "Website Visitor";
    setChatState("chatting");
    setMessages([
      {
        role: "assistant",
        content: `Hello${customerName ? `, ${customerName}` : ""}! I'm SupportBot, your customer support assistant. How can I help you today?`,
      },
    ]);
  };

  const streamChat = useCallback(async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        conversationId,
        customerName: customerName || "Website Visitor",
        customerEmail: customerEmail || null,
      }),
    });

    const newConversationId = resp.headers.get("X-Conversation-Id");
    if (newConversationId && !conversationId) {
      setConversationId(newConversationId);
    }

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        toast({
          variant: "destructive",
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment and try again.",
        });
        throw new Error("Rate limited");
      }
      if (resp.status === 402) {
        toast({
          variant: "destructive",
          title: "Service Unavailable",
          description: "Service temporarily unavailable. Please try again later.",
        });
        throw new Error("Payment required");
      }
      throw new Error(errorData.error || "Failed to send message");
    }

    const contentType = resp.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      const data = await resp.json();
      if (data.type === "escalation") {
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        setChatState("escalated");
        setWaitingForAgent(true);
        return data.message;
      }
      throw new Error(data.error || "Unknown error");
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
  }, [toast, conversationId, customerEmail, customerName]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // If escalated, send directly to database for agent
    if (chatState === "escalated" && conversationId) {
      try {
        const { error } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          content: userMessage.content,
          sender_type: "customer",
        });

        if (error) throw error;

        await supabase
          .from("conversations")
          .update({
            last_message: userMessage.content,
            updated_at: new Date().toISOString(),
            unread_count: 1,
          })
          .eq("id", conversationId);

        setWaitingForAgent(true);
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send message. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      await streamChat([...messages, userMessage]);
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
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setChatState("email_collection");
    setCustomerEmail("");
    setCustomerName("");
    setWaitingForAgent(false);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "scale-0 opacity-0"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300",
          "w-[380px] h-[560px]",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">SupportBot</h3>
              <p className="text-xs opacity-80">
                {chatState === "escalated" ? "Connected to Agent" : "Customer Support"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Email Collection */}
        {chatState === "email_collection" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Welcome!</h3>
              <p className="text-sm text-muted-foreground">
                Please provide your details so we can better assist you.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                startChat();
              }}
              className="w-full space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Name (optional)
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <Button type="submit" className="w-full">
                Start Chat
              </Button>
              <button
                type="button"
                onClick={startChat}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip and start chatting
              </button>
            </form>
          </div>
        )}

        {/* Chat Interface */}
        {chatState !== "email_collection" && (
          <>
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <UserRound className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Escalation/Waiting Banner */}
            {chatState === "escalated" && waitingForAgent && (
              <div className="border-t border-border bg-accent/50 p-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Waiting for a human agent to respond...</span>
                </div>
              </div>
            )}

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
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
