import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, 
  Bot,
  User,
  Headphones,
  CheckCircle,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

export default function LiveChat() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .in('status', ['live', 'waiting'])
      .order('updated_at', { ascending: false });

    setConversations(data || []);
    setLoading(false);

    if (conversationId && data) {
      const conv = data.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        fetchMessages(conversationId);
      }
    }
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to realtime updates for messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new && (payload.new as Message).conversation_id === selectedConversation?.id) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const convChannel = supabase
      .channel('conv-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(convChannel);
    };
  }, [selectedConversation?.id]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    fetchMessages(conv.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConversation.id,
      sender_type: 'agent',
      sender_id: user?.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message' });
    } else {
      // Update conversation last message
      await supabase
        .from('conversations')
        .update({ 
          last_message: newMessage.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);
      
      setNewMessage('');
    }
  };

  const handleResolve = async () => {
    if (!selectedConversation) return;

    await supabase
      .from('conversations')
      .update({ status: 'resolved' })
      .eq('id', selectedConversation.id);

    toast({ title: 'Conversation resolved' });
    setSelectedConversation(null);
    fetchConversations();
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-7rem)] gap-4">
        {/* Conversations List */}
        <div className="w-80 flex flex-col glass rounded-xl overflow-hidden shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              Live Queue
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {loading ? (
              <div className="text-center text-muted-foreground py-4">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active chats</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all",
                    selectedConversation?.id === conv.id
                      ? "bg-primary/20 ring-1 ring-primary/50"
                      : "hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {conv.customer_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{conv.customer_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.last_message || 'No messages'}</p>
                    </div>
                    <Badge variant={conv.status === 'live' ? 'live' : 'pending'} className="text-xs">
                      {conv.status}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 glass rounded-xl overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 hover:bg-secondary rounded-lg"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {selectedConversation.customer_name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{selectedConversation.customer_name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedConversation.customer_email}</p>
                  </div>
                </div>
                <Button variant="success" size="sm" onClick={handleResolve}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 animate-fade-in",
                      message.sender_type === 'agent' && "flex-row-reverse"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      message.sender_type === 'customer' && "bg-muted",
                      message.sender_type === 'bot' && "bg-accent/20 text-accent",
                      message.sender_type === 'agent' && "bg-primary/20 text-primary"
                    )}>
                      {message.sender_type === 'customer' && <User className="h-4 w-4" />}
                      {message.sender_type === 'bot' && <Bot className="h-4 w-4" />}
                      {message.sender_type === 'agent' && <Headphones className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      message.sender_type === 'agent' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-secondary rounded-tl-none"
                    )}>
                      <p className="text-sm">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        message.sender_type === 'agent' ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {new Date(message.created_at!).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
