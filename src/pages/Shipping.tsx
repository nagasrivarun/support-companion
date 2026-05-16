import { ShopHeader } from "@/components/shop/ShopHeader";
import { SEO } from "@/components/SEO";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Truck, Globe, Clock, Package, CreditCard, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const shippingRegions = [
  {
    region: "India",
    flag: "🇮🇳",
    standard: "5-7 business days",
    express: "2-3 business days",
    freeThreshold: "₹4,000",
    standardRate: "₹99",
    expressRate: "₹249",
    customs: "No customs duties for domestic orders",
    notes: "Free shipping on orders over ₹4,000"
  },
];

const Shipping = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shipping & Delivery — Shop India"
        description="Fast delivery across India in 2–7 business days. Free shipping on orders over ₹4,000. Track every order end to end."
        path="/shipping"
      />
      <ShopHeader />

      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Truck className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Shipping Information
            </h1>
            <p className="text-lg text-muted-foreground">
              We currently ship across India! Find delivery times, rates, and more details below. International shipping coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Globe className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">All India</p>
                <p className="text-sm text-muted-foreground">Pan-India delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Clock className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">2-14 Days</p>
                <p className="text-sm text-muted-foreground">Delivery times</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Package className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Free Tracking</p>
                <p className="text-sm text-muted-foreground">On all orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
              <CreditCard className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">UPI, Cards & More</p>
                <p className="text-sm text-muted-foreground">Secure payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Regions */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Shipping Rates by Region
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shippingRegions.map((region) => (
              <Card key={region.region} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-2xl">{region.flag}</span>
                    {region.region}
                  </CardTitle>
                  <CardDescription>
                    Free shipping over {region.freeThreshold}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Standard</span>
                      <Badge variant="secondary">{region.standard}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rate</span>
                      <span className="font-medium text-foreground">{region.standardRate}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Express</span>
                      <Badge variant="default">{region.express}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rate</span>
                      <span className="font-medium text-foreground">{region.expressRate}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{region.customs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Important Information
            </h2>
            
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Order Processing</h3>
                <p className="text-muted-foreground text-sm">
                  Orders are processed within 1-2 business days. You'll receive a confirmation email 
                  with tracking information once your order ships.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">No Hidden Charges</h3>
                <p className="text-muted-foreground text-sm">
                  All prices include applicable taxes. No customs or import duties for domestic orders 
                  within India. What you see is what you pay.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Delivery Issues</h3>
                <p className="text-muted-foreground text-sm">
                  If your package is delayed or lost, please contact our support team. We'll work 
                  with the carrier to resolve the issue or provide a replacement/refund.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">International Shipping — Coming Soon!</h3>
                <p className="text-muted-foreground text-sm">
                  We're working on expanding to more countries soon. Stay tuned for international 
                  shipping updates! Subscribe to our newsletter to be the first to know.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default Shipping;
