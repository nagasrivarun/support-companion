import { useCompareStore } from "@/stores/compareStore";
import { Button } from "@/components/ui/button";
import { X, BarChart3 } from "lucide-react";

export const CompareFloatingBar = () => {
  const items = useCompareStore(s => s.items);
  const removeItem = useCompareStore(s => s.removeItem);
  const clearAll = useCompareStore(s => s.clearAll);
  const setOpen = useCompareStore(s => s.setOpen);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {items.map(p => (
            <div key={p.id} className="flex-shrink-0 flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
              <img src={p.image} alt={p.title} className="h-10 w-10 rounded object-cover" />
              <span className="text-xs text-foreground max-w-[100px] truncate">{p.title}</span>
              <button onClick={() => removeItem(p.id)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {items.length < 4 && (
            <span className="text-xs text-muted-foreground flex-shrink-0">Add up to {4 - items.length} more</span>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
          <Button size="sm" onClick={() => setOpen(true)} disabled={items.length < 2} className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Compare ({items.length})
          </Button>
        </div>
      </div>
    </div>
  );
};
