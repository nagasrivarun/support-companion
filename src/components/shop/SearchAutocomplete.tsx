import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic, MicOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchLocalProducts, type LocalProduct } from "@/data/products";
import { toast } from "sonner";

interface SearchAutocompleteProps {
  onClose: () => void;
  alwaysVisible?: boolean;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const SearchAutocomplete = ({ onClose, alwaysVisible }: SearchAutocompleteProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocalProduct[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const supportsVoice = !!SpeechRecognition;

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

  useEffect(() => {
    if (alwaysVisible) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, alwaysVisible]);

  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const toggleVoice = useCallback(() => {
    if (!supportsVoice) {
      toast.error("Voice search is not supported in this browser");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setQuery(transcript);
    };
    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") toast.error("Voice search error. Please try again.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isListening, supportsVoice]);

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
          placeholder={isListening ? "Listening..." : "Search products..."}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`pl-10 pr-28 ${isListening ? "ring-2 ring-destructive/50" : ""}`}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {supportsVoice && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isListening ? "text-destructive animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
              onClick={toggleVoice}
              title={isListening ? "Stop listening" : "Voice search"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button type="submit" size="sm">
            Search
          </Button>
        </div>
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
                <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                  <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.productType}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</p>
                  {discount > 0 && <p className="text-xs text-destructive">-{discount}%</p>}
                </div>
              </button>
            );
          })}
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
