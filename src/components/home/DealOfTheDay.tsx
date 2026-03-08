import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Flame, Clock } from "lucide-react";
import { LOCAL_PRODUCTS, type LocalProduct } from "@/data/products";

// Pick a "deal of the day" based on the current date (rotates daily)
function getDealProduct(): LocalProduct {
  const deals = LOCAL_PRODUCTS.filter(p => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => {
      const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
      const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
      return db - da;
    });
  const dayIndex = new Date().getDate() % deals.length;
  return deals[dayIndex];
}

function getEndOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

export const DealOfTheDay = () => {
  const product = useMemo(() => getDealProduct(), []);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const [remaining, setRemaining] = useState(() => {
    const diff = getEndOfDay().getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = getEndOfDay().getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(diff / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { h, m, s } = formatTime(remaining);

  return (
    <section className="bg-background mt-3 py-6">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <Link
              to={`/product/${product.handle}`}
              className="md:w-1/3 aspect-square md:aspect-auto overflow-hidden bg-muted"
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </Link>

            {/* Details */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-5 w-5 text-destructive" />
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Deal of the Day</h2>
                <Badge variant="destructive" className="ml-auto text-sm">
                  {discount}% OFF
                </Badge>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ends in</span>
                <div className="flex gap-1">
                  {[
                    { val: h, label: "h" },
                    { val: m, label: "m" },
                    { val: s, label: "s" },
                  ].map(({ val, label }) => (
                    <div key={label} className="bg-foreground text-background rounded px-2 py-1 text-center min-w-[2.5rem]">
                      <span className="text-lg font-bold font-mono">{String(val).padStart(2, "0")}</span>
                      <span className="text-[10px] ml-0.5">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to={`/product/${product.handle}`}>
                <h3 className="text-lg md:text-xl font-semibold text-foreground hover:text-primary transition-colors mb-2">
                  {product.title}
                </h3>
              </Link>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i <= Math.floor(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount.toLocaleString("en-IN")} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-bold text-primary">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-sm font-medium text-destructive">
                  Save ₹{((product.originalPrice || product.price) - product.price).toLocaleString("en-IN")}
                </span>
              </div>

              <Link to={`/product/${product.handle}`}>
                <Button size="lg" className="gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Grab This Deal
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
