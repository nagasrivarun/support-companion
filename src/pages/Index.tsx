import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LOCAL_PRODUCTS, getCategories, getProductsByCategory, getProductByHandle, getVendorsList, type LocalProduct } from "@/data/products";
import { Star, ChevronRight, ChevronLeft, Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { SearchAutocomplete } from "@/components/shop/SearchAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useBrowsingHistory } from "@/stores/browsingHistory";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

import fashionBanner from "@/assets/banners/fashion-sale.jpg";
import electronicsBanner from "@/assets/banners/electronics-deals.jpg";
import footwearBanner from "@/assets/banners/footwear-collection.jpg";
import accessoriesBanner from "@/assets/banners/accessories-summer.jpg";
import bagsBanner from "@/assets/banners/bags-collection.jpg";

const emailSchema = z.string().trim().email().max(255);

// ── Hero Banner Carousel ────────────────────────────────────────
const banners = [
  { image: fashionBanner, link: "/shop?category=Clothing", alt: "Fashion Sale up to 50% off", title: "Fashion Sale", subtitle: "Up to 50% Off on Clothing", cta: "Shop Now" },
  { image: electronicsBanner, link: "/shop?category=Audio", alt: "Audio & Electronics deals starting ₹199", title: "Electronics Deals", subtitle: "Premium Audio & Gadgets from ₹199", cta: "Explore" },
  { image: footwearBanner, link: "/shop?category=Footwear", alt: "Footwear collection new arrivals", title: "New Arrivals", subtitle: "Footwear Collection for Every Style", cta: "Shop Footwear" },
  { image: accessoriesBanner, link: "/shop?category=Accessories", alt: "Summer Accessories Sale up to 40% off", title: "Accessories", subtitle: "Premium Watches, Belts & More — 40% Off", cta: "Browse" },
  { image: bagsBanner, link: "/shop?category=Bags", alt: "Bags Collection starting ₹599", title: "Bags Collection", subtitle: "Backpacks, Totes & Messenger Bags from ₹599", cta: "Shop Bags" },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(i => (i + 1) % banners.length), []);
  const prev = useCallback(() => setCurrent(i => (i - 1 + banners.length) % banners.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden bg-muted">

      <div className="relative aspect-[3.3/1] md:aspect-[3.5/1]">
        {banners.map((b, i) => (
          <Link
            key={i}
            to={b.link}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <img src={b.image} alt={b.alt} className="w-full h-full object-cover" />
          </Link>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-card/80 hover:bg-card border border-border rounded-md p-2 shadow-lg"
      >
        <ChevronLeft className="h-6 w-6 text-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-card/80 hover:bg-card border border-border rounded-md p-2 shadow-lg"
      >
        <ChevronRight className="h-6 w-6 text-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-foreground/30"}`}
          />
        ))}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/60 to-transparent z-10 pointer-events-none" />
    </section>
  );
};

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

// ── Featured Product Card ───────────────────────────────────────
const FeaturedProductCard = ({ product }: { product: LocalProduct }) => (
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

// ── Horizontal Scroll Carousel ──────────────────────────────────
const ProductCarousel = ({ title, products, linkText = "See all offers" }: { title: string; products: LocalProduct[]; linkText?: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -scrollRef.current.clientWidth * 0.8 : scrollRef.current.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-4">
      <div className="flex items-baseline gap-4 mb-3 px-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {linkText && <Link to="/shop" className="text-sm text-primary hover:underline">{linkText}</Link>}
      </div>
      <div className="relative group">
        <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-r-md p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-4 scrollbar-hide scroll-smooth">
          {products.map(p => {
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
    </section>
  );
};

// ── Browsing History Strip ──────────────────────────────────────
const BrowsingHistoryStrip = ({ products }: { products: LocalProduct[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const clearHistory = useBrowsingHistory(s => s.clearHistory);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -scrollRef.current.clientWidth * 0.8 : scrollRef.current.clientWidth * 0.8, behavior: "smooth" });
  };
  if (products.length === 0) return null;

  return (
    <section className="py-4 border-t border-border">
      <div className="flex items-baseline gap-4 mb-3 px-4">
        <h2 className="text-xl font-bold text-foreground">Your browsing history</h2>
        <button onClick={clearHistory} className="text-sm text-primary hover:underline">View or edit your browsing history</button>
      </div>
      <div className="relative group">
        <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-r-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 scrollbar-hide scroll-smooth">
          {products.map(p => (
            <Link key={p.id} to={`/product/${p.handle}`} className="flex-shrink-0">
              <div className="w-[120px] h-[120px] rounded bg-muted overflow-hidden hover:ring-2 hover:ring-primary transition-all">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              </div>
            </Link>
          ))}
        </div>
        <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-l-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </section>
  );
};

// ── Footer with Newsletter ──────────────────────────────────────
const FooterNewsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = emailSchema.safeParse(email);
    if (!validation.success) { toast.error("Please enter a valid email"); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: validation.data });
      if (error) {
        if (error.code === "23505") { toast.info("Already subscribed!"); setIsSubscribed(true); }
        else throw error;
      } else { setIsSubscribed(true); toast.success("Subscribed successfully!"); }
    } catch { toast.error("Failed to subscribe. Try again."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="bg-secondary/50 border-t border-border py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Stay in the Loop</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Get exclusive offers and 10% off your first purchase!</p>
        {isSubscribed ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">You're subscribed!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1" disabled={isLoading} />
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

const Footer = () => (
  <>
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="w-full py-3 bg-secondary hover:bg-secondary/80 text-sm text-foreground text-center transition-colors">
      Back to top
    </button>

    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-foreground mb-3">Get to Know Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">Shop With Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=Clothing" className="text-muted-foreground hover:text-foreground transition-colors">Clothing</Link></li>
              <li><Link to="/shop?category=Footwear" className="text-muted-foreground hover:text-foreground transition-colors">Footwear</Link></li>
              <li><Link to="/shop?category=Audio" className="text-muted-foreground hover:text-foreground transition-colors">Audio</Link></li>
              <li><Link to="/shop?category=Phones & Tablets" className="text-muted-foreground hover:text-foreground transition-colors">Phones & Tablets</Link></li>
              <li><Link to="/shop?category=Computers %26 Laptops" className="text-muted-foreground hover:text-foreground transition-colors">Computers & Laptops</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">Let Us Help You</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account" className="text-muted-foreground hover:text-foreground transition-colors">Your Account</Link></li>
              <li><Link to="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-muted-foreground hover:text-foreground transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/wishlist" className="text-muted-foreground hover:text-foreground transition-colors">Your Wishlist</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Help</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">Connect with Us</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>
      </div>

      <FooterNewsletter />

      <div className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1 mb-3">
            <span className="text-xl font-extrabold tracking-tight text-gradient">SHOP</span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground ml-1 mt-1">India</span>
          </Link>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SHOP India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </>
);

// ── Main Page ───────────────────────────────────────────────────
const Index = () => {
  const navigate = useNavigate();
  const viewedHandles = useBrowsingHistory(s => s.viewedHandles);

  const recentlyViewed = viewedHandles.map(h => getProductByHandle(h)).filter((p): p is LocalProduct => !!p);
  const lastViewed = recentlyViewed[0];

  const clothing = getProductsByCategory("Clothing");
  const footwear = getProductsByCategory("Footwear");
  const accessories = getProductsByCategory("Accessories");
  const audio = [...getProductsByCategory("Audio"), ...getProductsByCategory("Wearable Tech")];
  const bags = getProductsByCategory("Bags");
  const cablesChargers = getProductsByCategory("Cables & Chargers");
  const phonesTablets = getProductsByCategory("Phones & Tablets");
  const peripherals = getProductsByCategory("Computer Peripherals");
  const phoneAccessories = getProductsByCategory("Phone Accessories");
  const computersLaptops = getProductsByCategory("Computers & Laptops");
  const homeDecor = getProductsByCategory("Home Decor");
  const kitchen = getProductsByCategory("Kitchen Appliances");
  const sports = getProductsByCategory("Sports & Fitness");
  const books = getProductsByCategory("Books");
  const toys = getProductsByCategory("Toys & Games");
  const beauty = getProductsByCategory("Beauty & Personal Care");
  const allBrands = getVendorsList();
  const mostLoved = [...LOCAL_PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount);
  const topRated = [...LOCAL_PRODUCTS].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  const bestDeals = [...LOCAL_PRODUCTS].filter(p => p.originalPrice && p.originalPrice > p.price).sort((a, b) => {
    const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
    const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
    return discB - discA;
  });

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <ShopHeader />

      {/* Search Bar Strip */}
      <div className="bg-background/60 backdrop-blur-sm border-b border-border py-3">
        <div className="container mx-auto px-4 max-w-3xl">
          <SearchAutocomplete onClose={() => {}} alwaysVisible />
          <div className="flex flex-wrap gap-2 mt-2">
            {["Sneakers", "Bluetooth Earbuds", "Watch", "Backpack", "Sunglasses", "Hoodie", "Power Bank"].map(term => (
              <button
                key={term}
                onClick={() => navigate(`/shop?search=${encodeURIComponent(term)}`)}
                className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <HeroBanner />

      {/* Card Grid 1 */}
      <section className="bg-transparent relative z-20 mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard title="Customers' Most-Loved Products" products={mostLoved.slice(0, 4)} linkTo="/shop" />
            {lastViewed ? (
              <FeaturedProductCard product={lastViewed} />
            ) : (
              <CategoryCard title="Top Rated Products" products={topRated.slice(0, 4)} linkTo="/shop" />
            )}
            <CategoryCard title="Customers' Most-Loved Fashion" products={clothing.slice(0, 4)} linkTo="/shop?category=Clothing" />
            <CategoryCard title={`Starting ₹${Math.min(...accessories.map(p => p.price))} | Accessories`} products={accessories.slice(0, 4)} linkTo="/shop?category=Accessories" />
          </div>
        </div>
      </section>

      {/* Deal of the Day */}
      <DealOfTheDay />

      {/* Deals Carousel */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <ProductCarousel title={`Starting ₹${Math.min(...footwear.map(p => p.price))} | Footwear Collection`} products={footwear} />
        </div>
      </section>

      {/* Phones & Tablets Carousel */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <ProductCarousel title={`Starting ₹${phonesTablets.length > 0 ? Math.min(...phonesTablets.map(p => p.price)).toLocaleString("en-IN") : "8,999"} | Phones & Tablets — All Brands`} products={phonesTablets} linkText="See all phones" />
        </div>
      </section>

      {/* Card Grid 2 */}
      <section className="bg-background mt-3 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard title="Audio & Wearable Tech" products={audio.slice(0, 4)} linkTo="/shop?category=Audio" />
            <CategoryCard title="Phones & Tablets" products={phonesTablets.slice(0, 4)} linkTo="/shop?category=Phones %26 Tablets" />
            <CategoryCard title="Cables & Chargers" products={cablesChargers.slice(0, 4)} linkTo="/shop?category=Cables %26 Chargers" />
            <CategoryCard title="Computer Peripherals" products={peripherals.slice(0, 4)} linkTo="/shop?category=Computer Peripherals" />
          </div>
        </div>
      </section>

      {/* Card Grid 3 */}
      <section className="bg-background mt-3 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard title="Bags & Luggage" products={bags.slice(0, 4)} linkTo="/shop?category=Bags" />
            <CategoryCard title={`Starting ₹${Math.min(...footwear.map(p => p.price))} | Footwear`} products={footwear.slice(0, 4)} linkTo="/shop?category=Footwear" />
            <CategoryCard title="Phone Accessories" products={phoneAccessories.slice(0, 4)} linkTo="/shop?category=Phone Accessories" />
            <CategoryCard title="Best Deals — Up to 60% Off" products={bestDeals.slice(0, 4)} linkTo="/shop" />
          </div>
        </div>
      </section>

      {/* Computers & Laptops Carousel */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <ProductCarousel title={`Starting ₹${computersLaptops.length > 0 ? Math.min(...computersLaptops.map(p => p.price)).toLocaleString("en-IN") : "18,999"} | Computers & Laptops`} products={computersLaptops} />
        </div>
      </section>

      {/* Card Grid 4 — New Categories */}
      <section className="bg-background mt-3 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard title="Home Decor" products={homeDecor.slice(0, 4)} linkTo="/shop?category=Home Decor" />
            <CategoryCard title="Kitchen Appliances" products={kitchen.slice(0, 4)} linkTo="/shop?category=Kitchen Appliances" />
            <CategoryCard title="Sports & Fitness" products={sports.slice(0, 4)} linkTo="/shop?category=Sports %26 Fitness" />
            <CategoryCard title="Computers & Laptops" products={computersLaptops.slice(0, 4)} linkTo="/shop?category=Computers %26 Laptops" />
          </div>
        </div>
      </section>

      {/* Beauty & Books Carousel */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <ProductCarousel title="Beauty & Personal Care" products={beauty} linkText="See all" />
        </div>
      </section>

      {/* Card Grid 5 — Books, Toys, Beauty */}
      <section className="bg-background mt-3 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard title="Books" products={books.slice(0, 4)} linkTo="/shop?category=Books" />
            <CategoryCard title="Toys & Games" products={toys.slice(0, 4)} linkTo="/shop?category=Toys %26 Games" />
            <CategoryCard title="Beauty & Personal Care" products={beauty.slice(0, 4)} linkTo="/shop?category=Beauty %26 Personal Care" />
            <CategoryCard title="Best Deals — Up to 60% Off" products={bestDeals.slice(0, 4)} linkTo="/shop" />
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="bg-background mt-3 py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground mb-4">Featured Brands</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {allBrands.map(brand => (
              <button
                key={brand}
                onClick={() => navigate(`/shop?search=${encodeURIComponent(brand)}`)}
                className="px-5 py-2.5 rounded-lg border border-border bg-card hover:bg-primary hover:text-primary-foreground text-sm font-medium text-foreground transition-colors shadow-sm"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Also Viewed Carousel */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <ProductCarousel title="Customers who viewed items also viewed" products={topRated.slice(0, 12)} linkText="" />
        </div>
      </section>

      {/* Browsing History */}
      <section className="bg-background mt-3">
        <div className="container mx-auto">
          <BrowsingHistoryStrip products={recentlyViewed} />
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
