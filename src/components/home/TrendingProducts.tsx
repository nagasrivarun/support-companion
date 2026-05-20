import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, Truck, Flame, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toShopifyProduct, type LocalProduct } from "@/data/products";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { normalizePricing, formatINR } from "@/lib/pricing";
import { RatingBlock } from "@/components/product/RatingBlock";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { toast } from "sonner";

interface Props {
  title: string;
  eyebrow?: string;
  products: LocalProduct[];
  linkTo?: string;
  badge?: "trending" | "deal";
}

export const TrendingProducts = ({ title, eyebrow, products, linkTo = "/shop", badge }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore(s => s.addItem);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollRef.current.clientWidth * 0.85 : scrollRef.current.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  const handleAdd = (e: React.MouseEvent, p: LocalProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const sp = toShopifyProduct(p);
    const v = sp.node.variants.edges[0]?.node;
    if (!v) return;
    const item: CartItem = {
      product: sp,
      variantId: v.id,
      variantTitle: v.title,
      price: v.price,
      quantity: 1,
      selectedOptions: [],
    };
    addItem(item);
    toast.success(`${p.title} added to cart`, { position: "top-center" });
  };

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex items-end justify-between mb-6 md:mb-8 gap-4">
        <div>
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-[10px] uppercase tracking-wider font-semibold text-primary mb-2">
              {badge === "trending" && <TrendingUp className="h-3 w-3" />}
              {badge === "deal" && <Flame className="h-3 w-3" />}
              {eyebrow}
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link to={linkTo} className="hidden sm:inline text-sm text-primary hover:underline">
            See all →
          </Link>
          <div className="hidden md:flex gap-1.5">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full glass hover:bg-primary/10 hover:border-primary/40 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full glass hover:bg-primary/10 hover:border-primary/40 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth -mx-4 px-4 pb-2 snap-x snap-mandatory">
        {products.map((p, idx) => {
          const np = normalizePricing(p);
          const isBestSeller = idx < 3;
          return (
            <Link
              key={p.id}
              to={`/product/${p.handle}`}
              className="group flex-shrink-0 w-[180px] md:w-[230px] snap-start"
            >
              <div className="relative rounded-2xl overflow-hidden glass border border-border/60 group-hover:border-primary/40 group-hover:shadow-[0_0_40px_-8px_hsl(var(--primary)/0.4)] transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-white/95 to-white/80 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Top-left badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {np.discountPercent > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-destructive text-destructive-foreground">
                        -{np.discountPercent}%
                      </span>
                    )}
                    {isBestSeller && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-primary text-white">
                        BEST SELLER
                      </span>
                    )}
                  </div>

                  {/* Wishlist */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                    <WishlistButton
                      variant="icon"
                      product={{
                        id: p.id,
                        handle: p.handle,
                        title: p.title,
                        image: p.image,
                        price: np.price,
                        currencyCode: p.currencyCode,
                      }}
                    />
                  </div>

                  {/* Quick add */}
                  <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Button
                      size="sm"
                      onClick={e => handleAdd(e, p)}
                      className="w-full h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Quick Add
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 md:p-4">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>

                  <div className="mt-1.5">
                    <RatingBlock rating={p.rating} reviewCount={p.reviewCount} size="xs" />
                  </div>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base md:text-lg font-extrabold text-foreground tracking-tight">
                      {formatINR(np.price)}
                    </span>
                    {np.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatINR(np.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-success">
                    <Truck className="h-3 w-3" />
                    <span className="font-medium">Free delivery · 2-day ETA</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
