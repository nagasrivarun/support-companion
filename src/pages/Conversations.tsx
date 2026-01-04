import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bot, 
  Headphones,
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Conversation = Database['public']['Tables']['conversations']['Row'];
type ConversationStatus = Database['public']['Enums']['conversation_status'];

const statusConfig: Record<ConversationStatus, { 
  icon: React.ElementType; 
  variant: 'bot' | 'live' | 'success' | 'pending';
  label: string;
}> = {
  bot: { icon: Bot, variant: 'bot', label: 'Bot Handling' },
  live: { icon: Headphones, variant: 'live', label: 'Live Agent' },
  resolved: { icon: CheckCircle, variant: 'success', label: 'Resolved' },
  waiting: { icon: Clock, variant: 'pending', label: 'Waiting' },
};

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConversationStatus | 'all'>('all');
  const navigate = useNavigate();

  const fetchConversations = async () => {
    let query = supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (!error) {
      setConversations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    conv.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(search.toLowerCase())
  );

  const handleTakeover = async (conversationId: string) => {
    await supabase
      .from('conversations')
      .update({ status: 'live' })
      .eq('id', conversationId);
    
    navigate(`/live-chat?conversation=${conversationId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conversations</h1>
          <p className="text-muted-foreground">Monitor and manage customer conversations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'bot', 'live', 'waiting', 'resolved'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="glass rounded-xl p-8 text-center text-muted-foreground">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const statusInfo = statusConfig[conversation.status || 'bot'];
              const StatusIcon = statusInfo.icon;
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "glass rounded-xl p-4 hover:bg-secondary/20 transition-all cursor-pointer",
                    conversation.unread_count && conversation.unread_count > 0 && "ring-1 ring-primary/50"
                  )}
                  onClick={() => navigate(`/live-chat?conversation=${conversation.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold shrink-0">
                      {conversation.customer_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {conversation.customer_name}
                        </h3>
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {conversation.updated_at && new Date(conversation.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {conversation.status === 'bot' || conversation.status === 'waiting' ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTakeover(conversation.id);
                        }}
                      >
                        <Headphones className="h-4 w-4 mr-1" />
                        Take Over
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
