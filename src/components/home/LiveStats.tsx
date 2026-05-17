import { useEffect, useState } from "react";
import { Package, Users, Store, Truck } from "lucide-react";

const stats = [
  { icon: Package, label: "Orders Delivered", value: 1284503, suffix: "+", color: "text-primary" },
  { icon: Truck, label: "Live Shipments", value: 8421, suffix: "", color: "text-accent" },
  { icon: Store, label: "Verified Sellers", value: 12640, suffix: "+", color: "text-primary" },
  { icon: Users, label: "Happy Customers", value: 920000, suffix: "+", color: "text-accent" },
];

const useCountUp = (target: number, duration = 1500) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setV(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
};

const StatCard = ({ icon: Icon, label, value, suffix, color }: typeof stats[number]) => {
  const n = useCountUp(value);
  return (
    <div className="group glass rounded-2xl p-5 md:p-6 hover-glow relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />
      <Icon className={`h-6 w-6 ${color} mb-3`} />
      <div className="text-2xl md:text-3xl font-extrabold text-foreground tabular-nums">
        {n.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

export const LiveStats = () => (
  <section className="container mx-auto px-4 py-10 md:py-14">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map(s => <StatCard key={s.label} {...s} />)}
    </div>
  </section>
);
