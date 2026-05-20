import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, ImageOff } from "lucide-react";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { CompareToggle } from "@/components/compare/CompareToggle";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { RatingBlock } from "@/components/product/RatingBlock";
import { getProductByHandle } from "@/data/products";
import { normalizePricing, formatINR } from "@/lib/pricing";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const { node } = product;
  const firstImage = node.images.edges[0]?.node;
  const firstVariant = node.variants.edges[0]?.node;
  const fallbackPrice = node.priceRange.minVariantPrice;
  const isAvailable = firstVariant?.availableForSale ?? true;

  // Use canonical normalized pricing from the local catalog so cards match the PDP.
  const pricing = useMemo(() => {
    const local = getProductByHandle(node.handle);
    if (local) return normalizePricing(local);
    return {
      price: parseFloat(fallbackPrice.amount) || 0,
      originalPrice: null as number | null,
      discountPercent: 0,
    };
  }, [node.handle, fallbackPrice.amount]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firstVariant) {
      toast.error("Product variant not available");
      return;
    }

    const cartItem: CartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    };

    addItem(cartItem);
    setIsAdding(true);
    
    toast.success(`${node.title} added to cart`, {
      position: "top-center",
    });

    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <Link to={`/product/${node.handle}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-muted relative">
          {(() => {
            const localProduct = getProductByHandle(node.handle);
            return localProduct ? <CompareToggle product={localProduct} /> : null;
          })()}
          {!imageError && firstImage ? (
            <img
              src={firstImage.url}
              alt={firstImage.altText || node.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageOff className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {!isAvailable && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
            {node.title}
          </h3>
          {node.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {node.description}
            </p>
          )}
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-foreground">{formatINR(pricing.price)}</span>
            {pricing.originalPrice && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatINR(pricing.originalPrice)}
                </span>
                <span className="text-xs font-semibold text-success">
                  {pricing.discountPercent}% OFF
                </span>
              </>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={!isAvailable || isAdding}
          >
            {isAdding ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
