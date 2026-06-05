import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { SEO } from "@/components/SEO";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, ShoppingCart, Trash2, Check } from "lucide-react";
import { RatingBlock } from "@/components/product/RatingBlock";
import { StockBadge } from "@/components/product/StockBadge";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import {
  getProductByHandle,
  toShopifyProduct,
  type LocalProduct,
} from "@/data/products";
import { normalizePricing, formatINR } from "@/lib/pricing";
import type { WishlistEntry } from "@/stores/wishlistStore";
import { toast } from "sonner";

const localToCartItem = (p: LocalProduct): CartItem => {
  const sp = toShopifyProduct(p);
  const variant = sp.node.variants.edges[0].node;
  return {
    product: sp,
    variantId: variant.id,
    variantTitle: variant.title,
    price: variant.price,
    quantity: 1,
    selectedOptions: [],
  };
};

function WishlistCard({
  entry,
  onRemove,
}: {
  entry: WishlistEntry;
  onRemove: (key: string) => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const product = getProductByHandle(entry.handle);
  const pricing = product
    ? normalizePricing(product)
    : { price: entry.price, originalPrice: null as number | null, discountPercent: 0 };
  const inStock = product?.inStock ?? true;
  const stock = inStock ? 8 : 0;

  const handleAddToCart = () => {
    if (!product || !inStock) return;
    addItem(localToCartItem(product));
    setAdded(true);
    toast.success(`${entry.title} added to cart`, { position: "top-center" });
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Card className="overflow-hidden group flex flex-col">
      <Link to={`/product/${entry.handle}`} className="relative">
        <div className="aspect-square bg-muted overflow-hidden">
          {entry.image ? (
            <img
              src={entry.image}
              alt={entry.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        {pricing.discountPercent > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 shadow">
            {pricing.discountPercent}% OFF
          </Badge>
        )}
      </Link>

      <CardContent className="p-4 flex flex-col flex-1">
        <Link to={`/product/${entry.handle}`}>
          <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.75rem] hover:text-primary transition-colors">
            {entry.title}
          </h3>
        </Link>

        {entry.variantLabel && (
          <p className="text-xs text-muted-foreground mt-1">{entry.variantLabel}</p>
        )}

        {product && (
          <div className="mt-1.5">
            <RatingBlock
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="xs"
            />
          </div>
        )}

        <div className="flex items-baseline gap-2 flex-wrap mt-2">
          <span className="text-lg font-bold text-foreground tracking-tight">
            {formatINR(pricing.price)}
          </span>
          {pricing.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(pricing.originalPrice)}
            </span>
          )}
        </div>

        <div className="mt-2">
          <StockBadge stock={stock} inStock={inStock} />
        </div>

        <div className="flex gap-2 mt-4 pt-2 mt-auto">
          <Button
            variant="default"
            className="flex-1"
            size="sm"
            onClick={handleAddToCart}
            disabled={!product || !inStock}
          >
            {added ? (
              <>
                <Check className="h-4 w-4 mr-1.5" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Cart
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Remove from wishlist"
            onClick={() => onRemove(entry.key)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Wishlist() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();

  // Memoized newest-first ordering.
  const ordered = useMemo(
    () => [...items].sort((a, b) => b.addedAt - a.addedAt),
    [items]
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Wishlist — Shop India"
        description="Your saved products on Shop India. Review favorites and move them to your cart when you're ready to buy."
        path="/wishlist"
        noIndex
      />
      <ShopHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          {ordered.length > 0 && (
            <span className="text-muted-foreground">({ordered.length} items)</span>
          )}
          {ordered.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground hover:text-destructive"
              onClick={clearWishlist}
            >
              Clear all
            </Button>
          )}
        </div>

        {ordered.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mx-auto mb-6 h-28 w-28">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" aria-hidden />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-border/60 bg-card/60">
                <Heart className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Tap the heart on any product to save it here. Your picks stay saved
              on this device — even after you close the browser.
            </p>
            <Link to="/shop">
              <Button size="lg">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ordered.map((entry) => (
              <WishlistCard
                key={entry.key}
                entry={entry}
                onRemove={removeFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
