import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Tag,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { getProductByHandle } from "@/data/products";
import { calculateCart, type CartLine } from "@/lib/cart";
import { formatINR } from "@/lib/pricing";

const CartLineRow = ({ line }: { line: CartLine }) => {
  const { updateQuantity, removeItem } = useCartStore();
  const item = line.item;
  const localProduct = getProductByHandle(item.product.node.handle);
  const image = item.product.node.images?.edges?.[0]?.node?.url;
  const variantLabel = item.selectedOptions
    ?.filter((o) => o.value && o.value !== "Default Title")
    .map((o) => o.value)
    .join(" · ");

  return (
    <div className="flex gap-4 py-5">
      <Link
        to={`/product/${item.product.node.handle}`}
        className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0"
      >
        {image && (
          <img
            src={image}
            alt={item.product.node.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${item.product.node.handle}`}
              className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {item.product.node.title}
            </Link>
            {variantLabel && (
              <p className="text-sm text-muted-foreground mt-0.5">{variantLabel}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-foreground">
                {formatINR(line.unitPrice)}
              </span>
              {line.originalUnitPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatINR(line.originalUnitPrice)}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={() => removeItem(item.variantId)}
            aria-label={`Remove ${item.product.node.title} from cart`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-1 rounded-lg border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.variantId, line.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <span
              key={line.quantity}
              className="w-9 text-center text-sm font-medium tabular-nums animate-value-bump"
              aria-live="polite"
            >
              {line.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.variantId, line.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>

          <div className="text-right">
            <div className="font-semibold text-foreground tabular-nums">
              {formatINR(line.lineTotal)}
            </div>
            {line.lineSavings > 0 && (
              <div className="text-xs text-success">
                Save {formatINR(line.lineSavings)}
              </div>
            )}
          </div>
        </div>

        {localProduct && (
          <a
            href={localProduct.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button size="sm" variant="outline" className="mt-3 h-8 text-xs gap-1">
              <ExternalLink className="h-3 w-3" aria-hidden="true" /> Buy on Amazon
            </Button>
          </a>
        )}
      </div>
    </div>
  );
};

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-4">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" aria-hidden="true" />
      <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-border">
        <ShoppingBag className="h-12 w-12 text-primary" aria-hidden="true" />
      </div>
    </div>
    <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
    <p className="text-muted-foreground max-w-sm mb-6">
      Looks like you haven't added anything yet. Explore our top products and find something you'll love.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <Link to="/shop">
        <Button size="lg" className="gap-2">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Start Shopping
        </Button>
      </Link>
      <Link to="/wishlist">
        <Button size="lg" variant="outline">View Wishlist</Button>
      </Link>
    </div>
  </div>
);

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const totals = useMemo(() => calculateCart(items), [items]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Your Shopping Cart | SHOP India"
        description="Review the items in your shopping cart, adjust quantities and check your order summary before buying on Amazon."
        path="/cart"
        noIndex
      />
      <ShopHeader />

      <main className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Shopping Cart
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {totals.totalItems} item{totals.totalItems !== 1 ? "s" : ""}
                </p>
              </div>
              <Link to="/shop" className="hidden sm:inline-flex">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue shopping
                </Button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-border bg-card/50 px-4 sm:px-6 divide-y divide-border">
                  {totals.lines.map((line) => (
                    <CartLineRow key={line.item.variantId} line={line} />
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Link to="/shop" className="sm:hidden">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive ml-auto gap-2"
                    onClick={clearCart}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear cart
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <aside className="lg:col-span-1">
                <div className="rounded-xl border border-border bg-card/50 p-5 sm:p-6 lg:sticky lg:top-24 space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

                  {!totals.qualifiesFreeShipping && (
                    <div className="flex items-start gap-2 rounded-lg bg-primary/10 p-3 text-sm">
                      <Truck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-muted-foreground">
                        Add{" "}
                        <span className="font-semibold text-foreground">
                          {formatINR(totals.remainingForFreeShipping)}
                        </span>{" "}
                        more for FREE delivery
                      </span>
                    </div>
                  )}

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium tabular-nums">{formatINR(totals.subtotal)}</span>
                    </div>
                    {totals.discountTotal > 0 && (
                      <div className="flex justify-between text-success">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" aria-hidden="true" /> Discount
                        </span>
                        <span className="font-medium tabular-nums">
                          −{formatINR(totals.discountTotal)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping estimate</span>
                      <span className={totals.qualifiesFreeShipping ? "text-success font-medium" : "font-medium tabular-nums"}>
                        {totals.shipping === 0 ? "FREE" : formatINR(totals.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax estimate (incl. GST)</span>
                      <span className="font-medium tabular-nums">{formatINR(totals.taxEstimate)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Grand total</span>
                    <span
                      key={totals.grandTotal}
                      className="text-xl font-bold text-primary tabular-nums animate-value-bump"
                    >
                      {formatINR(totals.grandTotal)}
                    </span>
                  </div>

                  {totals.discountTotal > 0 && (
                    <Badge variant="secondary" className="w-full justify-center py-1.5 text-success">
                      You save {formatINR(totals.discountTotal)} on this order
                    </Badge>
                  )}

                  <Button size="lg" className="w-full gap-2" asChild>
                    <Link to="/shop">
                      <ExternalLink className="h-4 w-4" aria-hidden="true" /> Checkout on Amazon
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center inline-flex items-center justify-center gap-1.5 w-full">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Secure checkout via Amazon.in
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
