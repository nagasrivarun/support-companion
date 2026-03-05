import { ShopHeader } from "@/components/shop/ShopHeader";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Newsletter } from "@/components/home/Newsletter";
import { FAQ } from "@/components/home/FAQ";

const Shop = () => {
  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Welcome to Our Store
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover quality products with secure checkout powered by Shopify Payments.
              Fast shipping across India. International shipping coming soon!
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Our Products</h2>
          <ProductGrid />
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      {/* FAQ Section */}
      <FAQ />

      {/* Support Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Shop;
