import { useState } from "react";
import { Link } from "react-router-dom";
import { useBrowsingHistory } from "@/stores/browsingHistory";
import { LOCAL_PRODUCTS, type LocalProduct } from "@/data/products";
import { Clock, ChevronRight, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const RecentlyViewedWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { viewedHandles, clearHistory } = useBrowsingHistory();

  const recentProducts: LocalProduct[] = viewedHandles
    .map(h => LOCAL_PRODUCTS.find(p => p.handle === h))
    .filter(Boolean) as LocalProduct[];

  if (recentProducts.length === 0) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      {/* Toggle tab */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground px-1.5 py-3 rounded-l-md shadow-lg hover:bg-primary/90 transition-colors"
        title="Recently Viewed"
      >
        <div className="flex flex-col items-center gap-1">
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <Clock className="h-4 w-4" />
          <span className="text-[10px] font-medium writing-mode-vertical" style={{ writingMode: "vertical-rl" }}>
            Recent
          </span>
        </div>
      </button>

      {/* Panel */}
      <div
        className={cn(
          "bg-card border border-border shadow-xl rounded-l-lg transition-all duration-300 overflow-hidden",
          isOpen ? "w-56 opacity-100" : "w-0 opacity-0"
        )}
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Recently Viewed</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearHistory} title="Clear history">
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {recentProducts.slice(0, 8).map(product => (
            <Link
              key={product.id}
              to={`/product/${product.handle}`}
              className="flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
              onClick={() => setIsOpen(false)}
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-10 w-10 rounded object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground line-clamp-1">{product.title}</p>
                <p className="text-xs font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
