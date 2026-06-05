import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useWishlistStore, wishlistKey, type WishlistInput } from "@/stores/wishlistStore";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: WishlistInput;
  variant?: "icon" | "full";
  className?: string;
}

export function WishlistButton({ product, variant = "icon", className }: WishlistButtonProps) {
  const { toggleWishlist } = useWishlist();
  const key = wishlistKey(product.id, product.selectedOptions, product.variantLabel);
  // Variant-aware, reactive membership check (memoized selector).
  const isWishlisted = useWishlistStore((s) => s.has(key));
  const [pop, setPop] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPop(true);
    setTimeout(() => setPop(false), 450);
    toggleWishlist(product); // optimistic — store updates synchronously
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isWishlisted}
        className={cn(
          "h-9 w-9 rounded-full bg-background/70 backdrop-blur-md hover:bg-background border border-border/60 shadow-sm",
          className
        )}
        onClick={handleClick}
      >
        <Heart
          className={cn(
            "h-[18px] w-[18px] transition-colors",
            isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground",
            pop && "animate-heart-pop"
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isWishlisted ? "secondary" : "outline"}
      className={className}
      onClick={handleClick}
      aria-pressed={isWishlisted}
    >
      <Heart
        className={cn(
          "h-4 w-4 mr-2",
          isWishlisted ? "fill-destructive text-destructive" : ""
        )}
      />
      {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
