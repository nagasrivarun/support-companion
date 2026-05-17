import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Truck, Zap, ShieldCheck, MapPin } from "lucide-react";

export const PremiumHero = () => {
  return (
    <section className="relative overflow-hidden bg-hero border-b border-border">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.07] animate-grid-pan pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)/0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong text-xs font-medium text-primary mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live delivery network across India
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-5">
              Direct Shipping{" "}
              <span className="text-gradient">Marketplace</span>{" "}
              for Faster &amp; Safer Deliveries
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Shop premium products from verified sellers and track every shipment in real time.
              UPI, RuPay &amp; COD supported pan-India.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Button asChild size="xl" className="bg-gradient-primary hover-glow text-white border-0">
                <Link to="/shop">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="glass border-primary/30 hover:border-primary/60 hover:bg-primary/10">
                <Link to="/shipping">
                  <Truck className="h-4 w-4" /> Track Shipment
                </Link>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified sellers</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-accent" /> Same-day in metros</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> 28,000+ pincodes</span>
            </div>
          </div>

          {/* Right: Animated shipping visual */}
          <div className="relative h-[380px] md:h-[440px] hidden lg:block">
            {/* Map dots backdrop */}
            <div className="absolute inset-0 rounded-3xl glass-strong overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, hsl(var(--primary)/0.6) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Shipping route line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 440" fill="none">
                <defs>
                  <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(217 100% 60%)" />
                    <stop offset="100%" stopColor="hsl(195 100% 60%)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50 360 Q 150 200, 230 250 T 360 80"
                  stroke="url(#routeGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  fill="none"
                  className="animate-pulse"
                />
              </svg>

              {/* Origin pin */}
              <div className="absolute bottom-12 left-8 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent glow-cyan" />
                <div className="glass-strong px-2.5 py-1 rounded-md text-[10px] font-semibold text-foreground">Warehouse · Mumbai</div>
              </div>

              {/* Destination pin */}
              <div className="absolute top-8 right-8 flex items-center gap-2">
                <div className="glass-strong px-2.5 py-1 rounded-md text-[10px] font-semibold text-foreground">Delivered · Delhi</div>
                <div className="w-3 h-3 rounded-full bg-success" />
              </div>

              {/* Floating package card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float">
                <div className="glass-strong rounded-2xl p-5 w-64 shadow-elevated">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center glow">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Order #FS-90412</div>
                      <div className="text-sm font-bold text-foreground">In transit</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                    <div className="h-full w-3/4 bg-gradient-primary rounded-full animate-shimmer-line" />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Out for delivery</span>
                    <span className="font-semibold text-primary">ETA 2h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
