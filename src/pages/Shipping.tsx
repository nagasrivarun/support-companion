import { ShopHeader } from "@/components/shop/ShopHeader";
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
    freeThreshold: "$50",
    standardRate: "₹99",
    expressRate: "₹249",
    customs: "No customs duties for domestic orders",
    notes: "Free shipping on orders over ₹4,000"
  },
  {
    region: "United States",
    flag: "🇺🇸",
    standard: "7-10 business days",
    express: "3-5 business days",
    freeThreshold: "$75",
    standardRate: "$9.99",
    expressRate: "$24.99",
    customs: "Orders under $800 are duty-free",
    notes: "Tracking available for all shipments"
  },
  {
    region: "United Kingdom",
    flag: "🇬🇧",
    standard: "7-12 business days",
    express: "4-6 business days",
    freeThreshold: "£60",
    standardRate: "£7.99",
    expressRate: "£19.99",
    customs: "VAT may apply on orders over £135",
    notes: "Royal Mail or DHL delivery"
  },
  {
    region: "Canada",
    flag: "🇨🇦",
    standard: "8-12 business days",
    express: "4-6 business days",
    freeThreshold: "CAD $100",
    standardRate: "CAD $12.99",
    expressRate: "CAD $29.99",
    customs: "Duties may apply on orders over CAD $20",
    notes: "Canada Post or FedEx delivery"
  },
  {
    region: "Australia",
    flag: "🇦🇺",
    standard: "10-14 business days",
    express: "5-7 business days",
    freeThreshold: "AUD $100",
    standardRate: "AUD $14.99",
    expressRate: "AUD $34.99",
    customs: "GST applies on orders over AUD $1,000",
    notes: "Australia Post delivery"
  },
  {
    region: "Germany",
    flag: "🇩🇪",
    standard: "7-10 business days",
    express: "4-5 business days",
    freeThreshold: "€70",
    standardRate: "€8.99",
    expressRate: "€22.99",
    customs: "EU VAT included in price",
    notes: "DHL or Deutsche Post delivery"
  },
  {
    region: "France",
    flag: "🇫🇷",
    standard: "7-10 business days",
    express: "4-5 business days",
    freeThreshold: "€70",
    standardRate: "€8.99",
    expressRate: "€22.99",
    customs: "EU VAT included in price",
    notes: "La Poste or DHL delivery"
  },
  {
    region: "UAE",
    flag: "🇦🇪",
    standard: "5-8 business days",
    express: "2-4 business days",
    freeThreshold: "AED 300",
    standardRate: "AED 39",
    expressRate: "AED 89",
    customs: "VAT 5% applies to all orders",
    notes: "Aramex or Emirates Post delivery"
  }
];

const Shipping = () => {
  return (
    <div className="min-h-screen bg-background">
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
              We ship worldwide! Find delivery times, rates, and customs information for your region.
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
                <p className="font-semibold text-foreground">8 Countries</p>
                <p className="text-sm text-muted-foreground">Worldwide shipping</p>
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
                <p className="font-semibold text-foreground">PayPal & Cards</p>
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
                <h3 className="font-semibold text-foreground mb-2">Customs & Duties</h3>
                <p className="text-muted-foreground text-sm">
                  International orders may be subject to import duties and taxes. These charges are 
                  the responsibility of the recipient and vary by country. Check with your local 
                  customs office for specific rates.
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
                <h3 className="font-semibold text-foreground mb-2">Expanding Soon</h3>
                <p className="text-muted-foreground text-sm">
                  We're constantly adding new shipping destinations! If your country isn't listed, 
                  contact us and we'll do our best to accommodate your order.
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
