import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: {
    id: string;
    handle: string;
    title: string;
    image?: string;
    price: number;
    currencyCode: string;
  };
  variant?: "icon" | "full";
  className?: string;
}

export function WishlistButton({ product, variant = "icon", className }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [pop, setPop] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPop(true);
    setTimeout(() => setPop(false), 450);
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
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
