import { ShieldCheck, Banknote, BadgeCheck, RotateCcw, Truck, MapPin } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Secure Payments", sub: "256-bit SSL" },
  { icon: Banknote, label: "COD Available", sub: "Pan-India" },
  { icon: BadgeCheck, label: "Verified Sellers", sub: "Quality checked" },
  { icon: RotateCcw, label: "Easy Returns", sub: "7-day window" },
  { icon: Truck, label: "Fast Delivery", sub: "Same-day in metros" },
  { icon: MapPin, label: "28,000+ Pincodes", sub: "Across India" },
];

export const TrustBadges = () => (
  <section className="container mx-auto px-4 py-8 md:py-10">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {badges.map(b => (
        <div
          key={b.label}
          className="glass rounded-xl p-3 md:p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-colors"
        >
          <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <b.icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs md:text-sm font-semibold text-foreground truncate">{b.label}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground truncate">{b.sub}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
