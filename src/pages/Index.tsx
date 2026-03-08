import { useRef } from "react";
import { Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LOCAL_PRODUCTS, getCategories, getProductsByCategory, getProductByHandle, type LocalProduct } from "@/data/products";
import { Star, ChevronRight, ChevronLeft, ChevronUp, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBrowsingHistory } from "@/stores/browsingHistory";

// ── Amazon-style 2x2 Category Card ─────────────────────────────
const CategoryCard = ({ title, products, linkTo }: { title: string; products: LocalProduct[]; linkTo: string }) => (
  <Card className="p-5 bg-card border-border h-full flex flex-col">
    <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>
    <div className="grid grid-cols-2 gap-2 flex-1">
      {products.slice(0, 4).map(p => (
        <Link key={p.id} to={`/product/${p.handle}`} className="block">
          <div className="aspect-square rounded bg-muted overflow-hidden">
            <img src={p.image} alt={p.title} className="h-full w-full object-cover hover:scale-105 transition-transform" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.title}</p>
        </Link>
      ))}
    </div>
    <Link to={linkTo} className="text-sm text-primary hover:text-primary/80 hover:underline mt-3 block">
      Explore more
    </Link>
  </Card>
);

// ── Featured Product Card (Pick up where you left off) ──────────
const FeaturedProductCard = ({ product }: { product: LocalProduct }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="p-5 bg-card border-border h-full flex flex-col">
      <h3 className="text-lg font-bold text-foreground mb-3">Pick up where you left off</h3>
      <Link to={`/product/${product.handle}`} className="flex-1 flex flex-col items-center">
        <div className="w-40 h-40 mx-auto overflow-hidden rounded bg-muted mb-3">
          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
        </div>
        <p className="text-sm text-foreground line-clamp-2 text-center mb-1">{product.title}</p>
        <p className="text-lg font-bold text-foreground">
          ₹{product.price.toLocaleString("en-IN")}
          <span className="text-xs align-super">00</span>
        </p>
      </Link>
      <Link to={`/product/${product.handle}`} className="text-sm text-primary hover:text-primary/80 hover:underline mt-3 block">
        See more
      </Link>
    </Card>
  );
};

// ── Horizontal Scroll Carousel ──────────────────────────────────
const ProductCarousel = ({ title, products, linkText = "See all offers" }: { title: string; products: LocalProduct[]; linkText?: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-4">
      <div className="flex items-baseline gap-4 mb-3 px-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <Link to="/shop" className="text-sm text-primary hover:underline">{linkText}</Link>
      </div>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-r-md p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map(p => (
            <CarouselProductCard key={p.id} product={p} />
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-l-md p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>
      </div>
    </section>
  );
};

const CarouselProductCard = ({ product }: { product: LocalProduct }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.handle}`} className="flex-shrink-0 w-[180px] group/card">
      <div className="w-[180px] h-[180px] bg-muted rounded overflow-hidden mb-2">
        <img src={product.image} alt={product.title} className="h-full w-full object-cover group-hover/card:scale-105 transition-transform" />
      </div>
      <p className="text-sm text-primary hover:text-primary/80 line-clamp-2 mb-1">{product.title}</p>
      <div className="flex items-center gap-1 mb-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={`h-3 w-3 ${i <= Math.floor(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
          ))}
        </div>
        <span className="text-xs text-primary">{product.reviewCount.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex items-baseline gap-1">
        {discount > 0 && <span className="text-xs text-destructive font-medium">-{discount}%</span>}
        <span className="text-base font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
        {product.originalPrice && (
          <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
        )}
      </div>
    </Link>
  );
};

// ── Browsing History Strip ──────────────────────────────────────
const BrowsingHistoryStrip = ({ products }: { products: LocalProduct[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const clearHistory = useBrowsingHistory(s => s.clearHistory);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-4 border-t border-border">
      <div className="flex items-baseline gap-4 mb-3 px-4">
        <h2 className="text-xl font-bold text-foreground">Your browsing history</h2>
        <button onClick={clearHistory} className="text-sm text-primary hover:underline">
          View or edit your browsing history
        </button>
      </div>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-r-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map(p => (
            <Link key={p.id} to={`/product/${p.handle}`} className="flex-shrink-0">
              <div className="w-[120px] h-[120px] rounded bg-muted overflow-hidden hover:ring-2 hover:ring-primary transition-all">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              </div>
            </Link>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-l-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </section>
  );
};

// ── Footer ──────────────────────────────────────────────────────
const Footer = () => (
  <>
    {/* Back to top */}
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="w-full py-3 bg-secondary hover:bg-secondary/80 text-sm text-foreground text-center transition-colors"
    >
      Back to top
    </button>

    {/* Footer Links */}
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-foreground mb-3">Get to Know Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">Shop With Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><Link to="/shop?category=Footwear" className="text-muted-foreground hover:text-foreground">Footwear</Link></li>
              <li><Link to="/shop?category=Accessories" className="text-muted-foreground hover:text-foreground">Accessories</Link></li>
              <li><Link to="/shop?category=Electronics" className="text-muted-foreground hover:text-foreground">Electronics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">Let Us Help You</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account" className="text-muted-foreground hover:text-foreground">Your Account</Link></li>
              <li><Link to="/shipping" className="text-muted-foreground hover:text-foreground">Shipping & Returns</Link></li>
              <li><Link to="/wishlist" className="text-muted-foreground hover:text-foreground">Your Wishlist</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground">Help</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">Connect with Us</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Facebook</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Twitter</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Instagram</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1 mb-3">
            <span className="text-xl font-extrabold tracking-tight text-gradient">SHOP</span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground ml-1 mt-1">India</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SHOP India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </>
);

// ── Main Index Page ─────────────────────────────────────────────
const Index = () => {
  const categories = getCategories();
  const viewedHandles = useBrowsingHistory(s => s.viewedHandles);

  // Recently viewed products
  const recentlyViewed = viewedHandles
    .map(h => getProductByHandle(h))
    .filter((p): p is LocalProduct => !!p);

  // Last viewed product for "Pick up where you left off"
  const lastViewed = recentlyViewed[0];

  // Category products
  const clothing = [
    ...getProductsByCategory("T-Shirts"),
    ...getProductsByCategory("Jeans"),
    ...getProductsByCategory("Hoodies"),
    ...getProductsByCategory("Shorts"),
  ];
  const footwear = getProductsByCategory("Footwear");
  const accessories = getProductsByCategory("Accessories");
  const electronics = getProductsByCategory("Electronics");
  const bags = getProductsByCategory("Bags");

  // Most loved (highest review counts)
  const mostLoved = [...LOCAL_PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount);

  // Best deals
  const bestDeals = [...LOCAL_PRODUCTS]
    .filter(p => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => {
      const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
      const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
      return discB - discA;
    });

  // Top rated
  const topRated = [...LOCAL_PRODUCTS].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <ShopHeader />

      {/* ── Card Grid Section (Amazon-style 2x2 cards) ── */}
      <section className="bg-background py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard
              title="Customers' Most-Loved Products"
              products={mostLoved.slice(0, 4)}
              linkTo="/shop"
            />

            {lastViewed ? (
              <FeaturedProductCard product={lastViewed} />
            ) : (
              <CategoryCard
                title="Top Rated Products"
                products={topRated.slice(0, 4)}
                linkTo="/shop"
              />
            )}

            <CategoryCard
              title="Customers' Most-Loved Fashion"
              products={clothing.slice(0, 4)}
              linkTo="/shop?category=T-Shirts"
            />

            <CategoryCard
              title={`Starting ₹${Math.min(...accessories.map(p => p.price))} | Accessories`}
              products={accessories.slice(0, 4)}
              linkTo="/shop?category=Accessories"
            />
          </div>
        </div>
      </section>

      {/* ── Deals Carousel ── */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <ProductCarousel
            title={`Starting ₹${Math.min(...footwear.map(p => p.price))} | Footwear Collection`}
            products={footwear}
          />
        </div>
      </section>

      {/* ── Second Card Grid ── */}
      <section className="bg-background mt-3 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard
              title="Best Deals on Electronics"
              products={electronics.slice(0, 4)}
              linkTo="/shop?category=Electronics"
            />
            <CategoryCard
              title="Bags & Backpacks"
              products={bags.slice(0, 4)}
              linkTo="/shop?category=Bags"
            />
            <CategoryCard
              title="Footwear for Every Occasion"
              products={footwear.slice(0, 4)}
              linkTo="/shop?category=Footwear"
            />
            <CategoryCard
              title="Today's Best Deals"
              products={bestDeals.slice(0, 4)}
              linkTo="/shop"
            />
          </div>
        </div>
      </section>

      {/* ── Browsing History Carousel ── */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <ProductCarousel
            title="Customers who viewed items in your browsing history also viewed"
            products={topRated.slice(0, 12)}
            linkText=""
          />
        </div>
      </section>

      {/* ── Browsing History Strip ── */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <BrowsingHistoryStrip products={recentlyViewed} />
        </div>
      </section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Footer ── */}
      <Footer />

      <ChatWidget />
    </div>
  );
};

export default Index;
