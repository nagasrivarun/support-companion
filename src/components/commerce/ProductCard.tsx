import { ExternalLink, ShoppingCart, ImageOff, Check, Plus, ChevronDown, ChevronUp, ArrowUpDown, DollarSign, X, Heart, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Product = {
  title: string;
  price: string;
  description: string;
  platform: string;
  url: string;
  image?: string;
};

interface ProductCardProps {
  product: Product;
  isSelected?: boolean;
  onToggleCompare?: (product: Product) => void;
  compareMode?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

const platformColors: Record<string, string> = {
  Amazon: "bg-orange-500",
  Walmart: "bg-blue-600",
  eBay: "bg-yellow-500",
  Target: "bg-red-500",
  "Best Buy": "bg-blue-700",
  Etsy: "bg-orange-600",
  Flipkart: "bg-yellow-400",
  AliExpress: "bg-red-600",
};

const platformLogos: Record<string, string> = {
  Amazon: "🛒",
  Walmart: "🏪",
  eBay: "🏷️",
  Target: "🎯",
  "Best Buy": "💻",
  Etsy: "🎨",
  Flipkart: "📦",
  AliExpress: "🌐",
};

export const ALL_PLATFORMS = ["Amazon", "Walmart", "eBay", "Target", "Best Buy", "Etsy", "Flipkart", "AliExpress"];

// Helper to extract numeric price
export function extractPrice(priceStr: string): number {
  const match = priceStr.match(/[\d,]+\.?\d*/);
  if (match) {
    return parseFloat(match[0].replace(/,/g, ''));
  }
  return 0;
}

export function ProductCard({ product, isSelected, onToggleCompare, compareMode, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const platformColor = platformColors[product.platform] || "bg-gray-500";
  const platformLogo = platformLogos[product.platform] || "🛍️";

  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg relative",
      isSelected ? "border-pink-500 ring-2 ring-pink-500/20" : "border-border hover:border-pink-500/50"
    )}>
      {/* Top right actions */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {/* Wishlist button */}
        {onToggleWishlist && (
          <button
            onClick={() => onToggleWishlist(product)}
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center transition-all",
              isWishlisted 
                ? "bg-pink-500 text-white" 
                : "bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:border-pink-500 hover:text-pink-500"
            )}
          >
            <Heart className={cn("h-3 w-3", isWishlisted && "fill-current")} />
          </button>
        )}
        
        {/* Compare checkbox */}
        {compareMode && onToggleCompare && (
          <button
            onClick={() => onToggleCompare(product)}
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center transition-all",
              isSelected 
                ? "bg-pink-500 text-white" 
                : "bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:border-pink-500"
            )}
          >
            {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8 mb-2" />
            <span className="text-xs">No image</span>
          </div>
        )}
        
        {/* Platform Badge */}
        <div className={cn(
          "absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1",
          platformColor
        )}>
          <span>{platformLogo}</span>
          <span>{product.platform}</span>
        </div>

        {/* Price Badge */}
        {product.price && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm text-sm font-bold text-foreground border border-border">
            {product.price}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
          {product.title}
        </h4>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {/* Action Button */}
        <Button
          asChild
          size="sm"
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
        >
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-1" />
            View on {product.platform}
          </a>
        </Button>
      </div>
    </div>
  );
}

type SortOption = "relevance" | "price-low" | "price-high";
type PriceFilter = "all" | "under25" | "25to50" | "50to100" | "100to200" | "over200";

interface ProductGridProps {
  products: Product[];
  compareProducts?: Product[];
  onToggleCompare?: (product: Product) => void;
  onOpenComparison?: () => void;
  wishlist?: Product[];
  onToggleWishlist?: (product: Product) => void;
}

export function ProductGrid({ 
  products, 
  compareProducts = [], 
  onToggleCompare, 
  onOpenComparison,
  wishlist = [],
  onToggleWishlist
}: ProductGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  if (products.length === 0) return null;

  // Get unique platforms from products
  const availablePlatforms = [...new Set(products.map(p => p.platform))];

  // Toggle platform filter
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Filter products by platform
  const platformFilteredProducts = selectedPlatforms.length > 0
    ? products.filter(p => selectedPlatforms.includes(p.platform))
    : products;

  // Filter products by price
  const filteredProducts = platformFilteredProducts.filter(product => {
    const price = extractPrice(product.price);
    switch (priceFilter) {
      case "under25": return price > 0 && price < 25;
      case "25to50": return price >= 25 && price <= 50;
      case "50to100": return price > 50 && price <= 100;
      case "100to200": return price > 100 && price <= 200;
      case "over200": return price > 200;
      default: return true;
    }
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return extractPrice(a.price) - extractPrice(b.price);
    }
    if (sortBy === "price-high") {
      return extractPrice(b.price) - extractPrice(a.price);
    }
    return 0; // relevance - keep original order
  });

  const displayedProducts = isExpanded ? sortedProducts : sortedProducts.slice(0, 4);
  const hasMoreProducts = sortedProducts.length > 4;
  const compareMode = !!onToggleCompare;

  return (
    <div className="space-y-2">
      {/* Header with count and compare button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShoppingCart className="h-3 w-3" />
          <span>Found {products.length} products</span>
        </div>
        {compareProducts.length >= 2 && onOpenComparison && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenComparison}
            className="h-6 text-xs px-2 border-pink-500/50 text-pink-500 hover:bg-pink-500/10"
          >
            Compare ({compareProducts.length})
          </Button>
        )}
      </div>

      {/* Filters Row 1: Price and Sort */}
      <div className="flex gap-2">
        <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as PriceFilter)}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <DollarSign className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="under25">Under $25</SelectItem>
            <SelectItem value="25to50">$25 - $50</SelectItem>
            <SelectItem value="50to100">$50 - $100</SelectItem>
            <SelectItem value="100to200">$100 - $200</SelectItem>
            <SelectItem value="over200">Over $200</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <ArrowUpDown className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters Row 2: Platform Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs w-full justify-between">
            <div className="flex items-center">
              <Store className="h-3 w-3 mr-1" />
              {selectedPlatforms.length === 0 
                ? "All Platforms" 
                : `${selectedPlatforms.length} selected`}
            </div>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {availablePlatforms.map(platform => (
            <DropdownMenuCheckboxItem
              key={platform}
              checked={selectedPlatforms.includes(platform)}
              onCheckedChange={() => togglePlatform(platform)}
            >
              <span className="mr-2">{platformLogos[platform] || "🛍️"}</span>
              {platform}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Compare mode hint */}
      {compareMode && compareProducts.length < 2 && (
        <p className="text-xs text-muted-foreground text-center">
          Tap + on products to compare (select 2-4)
        </p>
      )}

      {/* No results after filter */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-4 text-xs text-muted-foreground">
          No products match your filters
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {displayedProducts.map((product, index) => (
              <ProductCard 
                key={index} 
                product={product}
                compareMode={compareMode}
                isSelected={compareProducts.some(p => p.url === product.url)}
                onToggleCompare={onToggleCompare}
                isWishlisted={wishlist.some(p => p.url === product.url)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
          {hasMoreProducts && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-xs border-pink-500/30 text-muted-foreground hover:text-foreground hover:border-pink-500/50"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {sortedProducts.length - 4} more products
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// Comparison Modal Component
interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
  onRemove: (product: Product) => void;
}

export function ProductComparison({ products, onClose, onRemove }: ProductComparisonProps) {
  if (products.length < 2) return null;

  const lowestPrice = Math.min(...products.map(p => extractPrice(p.price)));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <h3 className="font-semibold">Compare Products ({products.length})</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto flex-1 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(180px, 1fr))` }}>
            {products.map((product, index) => {
              const price = extractPrice(product.price);
              const isLowest = price === lowestPrice && price > 0;

              return (
                <div key={index} className="space-y-3">
                  {/* Image */}
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageOff className="h-8 w-8" />
                      </div>
                    )}
                    <button
                      onClick={() => onRemove(product)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Title */}
                  <h4 className="font-medium text-sm line-clamp-2">{product.title}</h4>

                  {/* Price */}
                  <div className={cn(
                    "text-lg font-bold",
                    isLowest ? "text-green-500" : "text-foreground"
                  )}>
                    {product.price}
                    {isLowest && <span className="text-xs ml-1 font-normal">Best Price!</span>}
                  </div>

                  {/* Platform */}
                  <div className="text-xs text-muted-foreground">
                    Sold on: <span className="font-medium text-foreground">{product.platform}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-3">{product.description}</p>

                  {/* Action */}
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wishlist Panel Component
interface WishlistPanelProps {
  products: Product[];
  onClose: () => void;
  onRemove: (product: Product) => void;
}

export function WishlistPanel({ products, onClose, onRemove }: WishlistPanelProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-current" />
            <h3 className="font-semibold">My Wishlist ({products.length})</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Wishlist Items */}
        <div className="overflow-auto flex-1 p-4">
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Your wishlist is empty</p>
              <p className="text-xs mt-1">Tap the heart icon on products to save them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={index} className="flex gap-3 p-2 rounded-lg border border-border hover:border-pink-500/50 transition-colors">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageOff className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{product.title}</h4>
                    <p className="text-xs text-muted-foreground">{product.platform}</p>
                    <p className="text-sm font-bold text-foreground mt-1">{product.price}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    >
                      <a href={product.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(product)}
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
