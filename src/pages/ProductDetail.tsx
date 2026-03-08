import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CompareToggle } from "@/components/compare/CompareToggle";
import { ProductReviews } from "@/components/product/ProductReviews";
import { getProductByHandle, getProductsByCategory, LOCAL_PRODUCTS, type LocalProduct } from "@/data/products";
import { useBrowsingHistory } from "@/stores/browsingHistory";
import { ArrowLeft, Star, ExternalLink, Truck, Shield, RotateCcw, Check, ChevronLeft, ChevronRight } from "lucide-react";

// Color name to CSS color mapping
const colorMap: Record<string, string> = {
  Black: "#1a1a1a", White: "#ffffff", Grey: "#9ca3af", Navy: "#1e3a5f",
  Red: "#ef4444", Blue: "#3b82f6", Green: "#22c55e", Yellow: "#eab308",
  Pink: "#ec4899", Purple: "#a855f7", Orange: "#f97316", Brown: "#92400e",
  Beige: "#d4b896", Cream: "#fffdd0", "Sky Blue": "#87CEEB", "Sage Green": "#9DC183",
  "Dusty Pink": "#D4A5A5", Lavender: "#E6E6FA", Peach: "#FFDAB9", Maroon: "#800000",
  Teal: "#008080", Charcoal: "#36454F", Silver: "#C0C0C0", Gold: "#FFD700",
  "White Floral": "#fff5f5", "Blue Floral": "#dbeafe", "Pink Floral": "#fce7f3",
};

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const product = handle ? getProductByHandle(handle) : undefined;
  const addViewed = useBrowsingHistory(s => s.addViewed);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (handle && product) {
      addViewed(handle);
      // Set defaults
      if (product.colors?.length) setSelectedColor(product.colors[0]);
      else setSelectedColor(null);
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
      else setSelectedSize(null);
    }
  }, [handle, product, addViewed]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <ShopHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/shop"><Button><ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop</Button></Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />

      <div className="container mx-auto px-4 py-8">
        <Link to="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted relative">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <p className="text-sm text-primary font-medium mb-1">{product.vendor}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.title}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`h-5 w-5 ${i <= Math.floor(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-sm text-primary font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount.toLocaleString("en-IN")} ratings)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 border-b border-border pb-4">
              <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  <Badge variant="secondary" className="text-xs">{discount}% off</Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Compare Button */}
            <CompareToggle product={product} variant="full" />

            {/* Options */}
            {product.sizes && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Size: <span className="text-primary">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === s
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-foreground hover:border-primary/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.colors && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Color: <span className="text-primary">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(c => {
                    const bgColor = colorMap[c] || "#9ca3af";
                    const isLight = ["White", "Cream", "Beige", "Yellow", "White Floral", "Lavender", "Peach", "Pink Floral"].includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        title={c}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === c
                            ? "border-primary ring-2 ring-primary/30 scale-110"
                            : isLight ? "border-border hover:border-primary/50" : "border-transparent hover:border-primary/50"
                        }`}
                        style={{ backgroundColor: bgColor }}
                      >
                        {selectedColor === c && (
                          <Check className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isLight ? "text-foreground" : "text-white"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Buy Button */}
            <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full gap-2 bg-warning text-warning-foreground hover:bg-warning/90 text-lg py-6">
                <ExternalLink className="h-5 w-5" /> Buy Now on Amazon
              </Button>
            </a>

            {/* Features */}
            {product.features && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Key Features</h3>
                <ul className="space-y-1">
                  {product.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust */}
            <div className="border-t border-border pt-5 space-y-3">
              {[
                { icon: Truck, text: "Fast delivery via Amazon" },
                { icon: Shield, text: "Amazon's secure checkout" },
                { icon: RotateCcw, text: "Easy returns & refunds" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon className="h-5 w-5 text-primary" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customers Also Bought */}
        <CustomersAlsoBought product={product} />

        {/* Reviews */}
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">Customer Reviews</h2>
          <ProductReviews productHandle={handle || ""} productTitle={product.title} />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
};

const CustomersAlsoBought = ({ product }: { product: LocalProduct }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -scrollRef.current.clientWidth * 0.8 : scrollRef.current.clientWidth * 0.8, behavior: "smooth" });
  };

  // Get products from same category, excluding current, then pad with top-rated from other categories
  const sameCategory = getProductsByCategory(product.productType).filter(p => p.id !== product.id);
  const otherProducts = LOCAL_PRODUCTS
    .filter(p => p.id !== product.id && p.productType !== product.productType)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  const related = [...sameCategory, ...otherProducts].slice(0, 12);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 border-t border-border pt-12">
      <h2 className="text-xl font-bold text-foreground mb-6">Customers who bought this also bought</h2>
      <div className="relative group">
        <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-r-md p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
          {related.map(p => {
            const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
            return (
              <Link key={p.id} to={`/product/${p.handle}`} className="flex-shrink-0 w-[180px] group/card">
                <div className="w-[180px] h-[180px] bg-muted rounded overflow-hidden mb-2">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover/card:scale-105 transition-transform" />
                </div>
                <p className="text-sm text-primary hover:text-primary/80 line-clamp-2 mb-1">{p.title}</p>
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-3 w-3 ${i <= Math.floor(p.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-primary">{p.reviewCount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  {discount > 0 && <span className="text-xs text-destructive font-medium">-{discount}%</span>}
                  <span className="text-base font-bold text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                  {p.originalPrice && <span className="text-xs text-muted-foreground line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>}
                </div>
              </Link>
            );
          })}
        </div>
        <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-l-md p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
