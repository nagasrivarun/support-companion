import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ExternalLink,
  Package,
  Truck,
  Check,
  Tag,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import { getProductByHandle } from "@/data/products";
import { FREE_DELIVERY_THRESHOLD, formatINR } from "@/lib/pricing";
import { calculateCart } from "@/lib/cart";
import { toast } from "@/hooks/use-toast";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const {
    items,
    updateQuantity,
    removeItem,
  } = useCartStore();

  const totals = useMemo(() => calculateCart(items), [items]);
  const totalItems = totals.totalItems;
  const totalPrice = totals.subtotal;
  const currency = totals.currency;

  const remainingForFree = totals.remainingForFreeShipping;
  const freeProgress = Math.min(100, (totalPrice / FREE_DELIVERY_THRESHOLD) * 100);
  const qualifiesFree = totals.qualifiesFreeShipping;


  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setAppliedCoupon(code);
    toast({
      title: "Coupon applied",
      description: `${code} will be applied on Amazon checkout where eligible.`,
    });
    setCoupon("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={`Open cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {totalItems > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground animate-value-bump"
              key={totalItems}
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Your cart is empty"
              : `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add products to get started</p>
              </div>
            </div>
          ) : (
            <>
              {/* Free shipping progress */}
              <div className="flex-shrink-0 mb-4 rounded-xl border border-border bg-card/50 p-3">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Truck className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  {qualifiesFree ? (
                    <span className="font-medium text-success inline-flex items-center gap-1">
                      <Check className="h-4 w-4" aria-hidden="true" /> You've unlocked FREE delivery!
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Add{" "}
                      <span className="font-semibold text-foreground">
                        {formatINR(remainingForFree)}
                      </span>{" "}
                      more for FREE delivery
                    </span>
                  )}
                </div>
                <Progress
                  value={freeProgress}
                  className="h-2"
                  aria-label="Progress toward free delivery"
                />
              </div>

              {/* Scrollable items area */}
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => {
                    const localProduct = getProductByHandle(item.product.node.handle);
                    return (
                      <div key={item.variantId} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="w-16 h-16 bg-background rounded-md overflow-hidden flex-shrink-0">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <img
                              src={item.product.node.images.edges[0].node.url}
                              alt={item.product.node.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate text-foreground">
                            {item.product.node.title}
                          </h4>
                          <p className="font-semibold text-primary">
                            {formatPrice(item.price.amount, item.price.currencyCode)}
                          </p>
                          {localProduct && (
                            <a
                              href={localProduct.amazonUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="mt-1 h-7 text-xs gap-1">
                                <ExternalLink className="h-3 w-3" aria-hidden="true" /> Buy on Amazon
                              </Button>
                            </a>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.variantId)}
                            aria-label={`Remove ${item.product.node.title} from cart`}
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </Button>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" aria-hidden="true" />
                            </Button>
                            <span
                              key={item.quantity}
                              className="w-8 text-center text-sm font-medium tabular-nums animate-value-bump"
                              aria-live="polite"
                            >
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fixed total section */}
              <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border bg-background">
                {/* Coupon */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Coupon code"
                      aria-label="Coupon code"
                      className="pl-9 h-10 uppercase placeholder:normal-case"
                    />
                  </div>
                  <Button variant="secondary" className="h-10" onClick={applyCoupon}>
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-success inline-flex items-center gap-1 -mt-2">
                    <Check className="h-3 w-3" aria-hidden="true" /> {appliedCoupon} applied
                  </p>
                )}

                {totals.discountTotal > 0 && (
                  <div className="flex justify-between items-center text-sm text-success">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" aria-hidden="true" /> Discount
                    </span>
                    <span className="font-medium">−{formatINR(totals.discountTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span className={qualifiesFree ? "text-success font-medium" : ""}>
                    {qualifiesFree ? "FREE" : formatINR(99)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span
                    key={totals.grandTotal}
                    className="text-xl font-bold text-primary tabular-nums animate-value-bump"
                  >
                    {formatPrice(totals.grandTotal.toString(), currency)}
                  </span>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link to="/cart" onClick={() => setIsOpen(false)}>
                    View Cart &amp; Checkout
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Click "Buy on Amazon" on each item to purchase
                </p>

              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
