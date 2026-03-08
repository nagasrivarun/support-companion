import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ProductReviews } from "@/components/product/ProductReviews";
import { getProductByHandle } from "@/data/products";
import { useBrowsingHistory } from "@/stores/browsingHistory";
import { ArrowLeft, Star, ExternalLink, Truck, Shield, RotateCcw, Check } from "lucide-react";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const product = handle ? getProductByHandle(handle) : undefined;
  const addViewed = useBrowsingHistory(s => s.addViewed);

  useEffect(() => {
    if (handle && product) {
      addViewed(handle);
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

            {/* Options */}
            {product.sizes && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <Badge key={s} variant="outline" className="px-3 py-1">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {product.colors && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <Badge key={c} variant="outline" className="px-3 py-1">{c}</Badge>
                  ))}
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

export default ProductDetail;
