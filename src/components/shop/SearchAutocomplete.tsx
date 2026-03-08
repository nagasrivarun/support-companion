import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchLocalProducts, type LocalProduct } from "@/data/products";

interface SearchAutocompleteProps {
  onClose: () => void;
  alwaysVisible?: boolean;
}

export const SearchAutocomplete = ({ onClose, alwaysVisible }: SearchAutocompleteProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocalProduct[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }
    const matches = searchLocalProducts(query.trim()).slice(0, 6);
    setResults(matches);
    setSelectedIndex(-1);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const goToProduct = (handle: string) => {
    navigate(`/product/${handle}`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      goToProduct(results[selectedIndex].handle);
    } else if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div ref={containerRef} className="pb-3 animate-fade-in">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          placeholder="Search products..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20"
        />
        <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
          Search
        </Button>
      </form>

      {/* Dropdown */}
      {results.length > 0 && (
        <div className="absolute left-0 right-0 mx-4 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((product, i) => {
            const discount = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => goToProduct(product.handle)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.productType}</p>
                </div>
                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</p>
                  {discount > 0 && (
                    <p className="text-xs text-destructive">-{discount}%</p>
                  )}
                </div>
              </button>
            );
          })}
          {/* View all */}
          <button
            type="button"
            onClick={() => {
              navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
              onClose();
            }}
            className="w-full px-3 py-2.5 text-sm text-primary font-medium text-center border-t border-border hover:bg-accent/50 transition-colors"
          >
            View all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
};
