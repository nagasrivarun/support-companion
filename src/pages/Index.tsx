import { ShopHeader } from "@/components/shop/ShopHeader";
import { SEO } from "@/components/SEO";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { PremiumHero } from "@/components/home/PremiumHero";
import { LiveStats } from "@/components/home/LiveStats";
import { TrustBadges } from "@/components/home/TrustBadges";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { BrandsStrip } from "@/components/home/BrandsStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustedLogos } from "@/components/home/TrustedLogos";
import { FAQ } from "@/components/home/FAQ";
import { PremiumFooter } from "@/components/home/PremiumFooter";
import { LOCAL_PRODUCTS, getVendorsList } from "@/data/products";

const Index = () => {
  const brands = getVendorsList().slice(0, 18);

  const trending = [...LOCAL_PRODUCTS]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 12);

  const bestDeals = [...LOCAL_PRODUCTS]
    .filter(p => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => {
      const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
      const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
      return db - da;
    })
    .slice(0, 12);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Shop India — Premium Marketplace & Fast Delivery"
        description="Shop premium fashion, electronics & more from verified sellers. Real-time tracking, UPI/COD across 28,000+ pincodes in India."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Shop India",
          description: "Premium marketplace with fast delivery across India",
          url: "/",
          areaServed: "IN",
          currenciesAccepted: "INR",
          paymentAccepted: "UPI, Credit Card, Debit Card, COD",
        }}
      />
      <ShopHeader />

      {/* 1. Hero */}
      <PremiumHero />

      {/* 2. Stats */}
      <LiveStats />

      {/* Trust signals */}
      <TrustBadges />

      {/* 3. Categories */}
      <CategoriesGrid />

      {/* 4. Featured deal */}
      <DealOfTheDay />

      {/* Best deals carousel */}
      <TrendingProducts
        title="Today's best deals"
        eyebrow="Limited time"
        badge="deal"
        products={bestDeals}
        linkTo="/shop"
      />

      {/* 5. Trending products */}
      <TrendingProducts
        title="Trending in India"
        eyebrow="Most loved"
        badge="trending"
        products={trending}
        linkTo="/shop"
      />

      {/* Logistics partners marquee */}
      <TrustedLogos />

      {/* 6. Brands */}
      <BrandsStrip brands={brands} />

      {/* 7. Testimonials */}
      <Testimonials />

      {/* 8. FAQ */}
      <FAQ />

      {/* 9. Footer */}
      <PremiumFooter />

      <ChatWidget />
    </div>
  );
};

export default Index;
