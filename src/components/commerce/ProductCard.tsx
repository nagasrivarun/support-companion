import { ExternalLink, ShoppingCart, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const platformColor = platformColors[product.platform] || "bg-gray-500";
  const platformLogo = platformLogos[product.platform] || "🛍️";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-pink-500/50 transition-all duration-200 hover:shadow-lg">
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

interface ProductGridProps {
  products: Product[];
}

import { useState as useLocalState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ProductGrid({ products }: ProductGridProps) {
  const [isExpanded, setIsExpanded] = useLocalState(false);
  
  if (products.length === 0) return null;

  const displayedProducts = isExpanded ? products : products.slice(0, 4);
  const hasMoreProducts = products.length > 4;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShoppingCart className="h-3 w-3" />
        <span>Found {products.length} products</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {displayedProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
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
              Show {products.length - 4} more products
            </>
          )}
        </Button>
      )}
    </div>
  );
}
