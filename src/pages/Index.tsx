import { Link, useSearchParams } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LOCAL_PRODUCTS, getCategories, getProductsByCategory, getProductByHandle, type LocalProduct } from "@/data/products";
import { Star, ChevronRight, Zap, Truck, Shield, RotateCcw, TrendingUp, Flame, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBrowsingHistory } from "@/stores/browsingHistory";

const StarRating = ({ rating, count }: { rating: number; count: number }) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= Math.floor(rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
    <span className="text-xs text-muted-foreground">{count.toLocaleString("en-IN")}</span>
  </div>
);

const DealCard = ({ product, rank }: { product: LocalProduct; rank?: number }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden border-border hover:border-primary/40 transition-all hover:shadow-lg h-full group">
      <Link to={`/product/${product.handle}`} className="block">
        <div className="aspect-square bg-muted overflow-hidden relative">
          <img src={product.image} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold">
              {discount}% OFF
            </Badge>
          )}
          {rank && (
            <div className="absolute bottom-2 left-2 bg-background/90 text-foreground text-xs font-bold px-2 py-1 rounded-full">
              #{rank} Best Seller
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">{product.title}</h3>
          <StarRating rating={product.rating} count={product.reviewCount} />
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full gap-2 bg-warning text-warning-foreground hover:bg-warning/90" size="sm">
            <ExternalLink className="h-3.5 w-3.5" /> Buy on Amazon
          </Button>
        </a>
      </div>
    </Card>
  );
};

const CategorySection = ({ category, products }: { category: string; products: LocalProduct[] }) => (
  <section className="py-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-foreground">{category}</h2>
      <Link to={`/shop?category=${encodeURIComponent(category)}`}>
        <Button variant="link" className="text-primary gap-1 p-0">
          See all <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.slice(0, 5).map(p => (
        <DealCard key={p.id} product={p} />
      ))}
    </div>
  </section>
);

const Index = () => {
  const categories = getCategories();
  const viewedHandles = useBrowsingHistory(s => s.viewedHandles);
  const clearHistory = useBrowsingHistory(s => s.clearHistory);

  // Recently viewed products
  const recentlyViewed = viewedHandles
    .map(h => getProductByHandle(h))
    .filter((p): p is LocalProduct => !!p)
    .slice(0, 6);

  // Trending: sorted by review count (popularity)
  const trending = [...LOCAL_PRODUCTS]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6);

  // Top rated: sorted by rating
  const topRated = [...LOCAL_PRODUCTS]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 6);

  // Best deals: highest discount percentage
  const bestDeals = [...LOCAL_PRODUCTS]
    .filter(p => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => {
      const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
      const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
      return discB - discA;
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-secondary to-muted border-b border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                Fashion & Lifestyle Store
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Discover trending products loved by thousands. Buy directly on Amazon with fast delivery across India.
              </p>
              <div className="flex gap-3">
                <Link to="/shop">
                  <Button size="lg" className="gap-2">
                    <Zap className="h-4 w-4" /> Shop Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {trending.slice(0, 3).map(p => (
                <Link key={p.id} to={`/product/${p.handle}`} className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Truck, text: "Amazon Delivery" },
              { icon: Shield, text: "Secure Shopping" },
              { icon: RotateCcw, text: "Easy Returns" },
              { icon: Zap, text: "Best Deals" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Trending Now */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Trending Now
            </h2>
            <Link to="/shop">
              <Button variant="link" className="text-primary gap-1 p-0">
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {trending.map((p, i) => (
              <DealCard key={p.id} product={p} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* Best Deals */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" /> Best Deals
            </h2>
            <Link to="/shop">
              <Button variant="link" className="text-primary gap-1 p-0">
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {bestDeals.map(p => (
              <DealCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Top Rated */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" /> Top Rated
            </h2>
            <Link to="/shop">
              <Button variant="link" className="text-primary gap-1 p-0">
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topRated.map(p => (
              <DealCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Category Sections */}
        {categories.map(cat => {
          const products = getProductsByCategory(cat);
          if (products.length === 0) return null;
          return <CategorySection key={cat} category={cat} products={products} />;
        })}
      </div>

      <ChatWidget />
    </div>
  );
};

export default Index;
