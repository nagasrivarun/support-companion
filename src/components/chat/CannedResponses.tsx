import { useState, useEffect } from 'react';
import { MessageSquarePlus, Plus, Search, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string | null;
  shortcut: string | null;
}

interface CannedResponsesProps {
  onSelect: (content: string) => void;
}

export function CannedResponses({ onSelect }: CannedResponsesProps) {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
  const [newResponse, setNewResponse] = useState({
    title: '',
    content: '',
    category: '',
    shortcut: '',
  });
  const { toast } = useToast();

  const fetchResponses = async () => {
    const { data, error } = await supabase
      .from('canned_responses')
      .select('*')
      .order('title');

    if (error) {
      console.error('Error fetching canned responses:', error);
      return;
    }

    setResponses(data || []);
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleSelect = (response: CannedResponse) => {
    onSelect(response.content);
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!newResponse.title.trim() || !newResponse.content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Title and content are required',
      });
      return;
    }

    const { error } = await supabase.from('canned_responses').insert({
      title: newResponse.title.trim(),
      content: newResponse.content.trim(),
      category: newResponse.category.trim() || null,
      shortcut: newResponse.shortcut.trim() || null,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save response',
      });
      return;
    }

    toast({ title: 'Response saved' });
    setNewResponse({ title: '', content: '', category: '', shortcut: '' });
    setIsDialogOpen(false);
    fetchResponses();
  };

  const handleUpdate = async (response: CannedResponse) => {
    const { error } = await supabase
      .from('canned_responses')
      .update({
        title: response.title,
        content: response.content,
        category: response.category,
        shortcut: response.shortcut,
        updated_at: new Date().toISOString(),
      })
      .eq('id', response.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update response',
      });
      return;
    }

    toast({ title: 'Response updated' });
    setEditingResponse(null);
    fetchResponses();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('canned_responses')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete response',
      });
      return;
    }

    toast({ title: 'Response deleted' });
    fetchResponses();
  };

  const filteredResponses = responses.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase()) ||
      r.shortcut?.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(responses.map((r) => r.category).filter(Boolean))];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" title="Canned Responses">
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-foreground text-sm">Canned Responses</h4>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Canned Response</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newResponse.title}
                      onChange={(e) => setNewResponse({ ...newResponse, title: e.target.value })}
                      placeholder="e.g., Greeting"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      value={newResponse.content}
                      onChange={(e) => setNewResponse({ ...newResponse, content: e.target.value })}
                      placeholder="The message content..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Input
                        value={newResponse.category}
                        onChange={(e) => setNewResponse({ ...newResponse, category: e.target.value })}
                        placeholder="e.g., Greetings"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Shortcut</label>
                      <Input
                        value={newResponse.shortcut}
                        onChange={(e) => setNewResponse({ ...newResponse, shortcut: e.target.value })}
                        placeholder="e.g., /greet"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    Save Response
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or type shortcut..."
              className="pl-8 h-8"
            />
          </div>
        </div>

        <ScrollArea className="h-64">
          {filteredResponses.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No responses found
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredResponses.map((response) => (
                <div
                  key={response.id}
                  className={cn(
                    "group p-2 rounded-lg transition-colors",
                    editingResponse?.id === response.id
                      ? "bg-secondary"
                      : "hover:bg-secondary/50 cursor-pointer"
                  )}
                >
                  {editingResponse?.id === response.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editingResponse.title}
                        onChange={(e) =>
                          setEditingResponse({ ...editingResponse, title: e.target.value })
                        }
                        className="h-7 text-sm"
                      />
                      <Textarea
                        value={editingResponse.content}
                        onChange={(e) =>
                          setEditingResponse({ ...editingResponse, content: e.target.value })
                        }
                        className="text-sm resize-none"
                        rows={2}
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdate(editingResponse)}
                          className="h-7"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingResponse(null)}
                          className="h-7"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => handleSelect(response)}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">
                          {response.title}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingResponse(response);
                            }}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            <Edit2 className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(response.id);
                            }}
                            className="p-1 hover:bg-destructive/20 rounded"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {response.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {response.category && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {response.category}
                          </Badge>
                        )}
                        {response.shortcut && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {response.shortcut}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
