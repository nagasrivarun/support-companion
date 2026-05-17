import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Verified buyer · Mumbai",
    initials: "AS",
    text: "Tracking was on point — package arrived in under 24 hours. The premium UI feels just like Amazon, but cleaner.",
    rating: 5,
  },
  {
    name: "Priya Iyer",
    role: "Verified buyer · Bengaluru",
    initials: "PI",
    text: "COD worked smoothly and the return policy is genuine. Will be ordering electronics here from now on.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "Verified buyer · Delhi",
    initials: "RM",
    text: "Sellers are verified and shipping ETAs are accurate to the hour. Honestly the smoothest checkout in India right now.",
    rating: 5,
  },
];

const colors = ["from-primary to-accent", "from-accent to-primary", "from-primary/80 to-accent/80"];

export const Testimonials = () => (
  <section className="container mx-auto px-4 py-14 md:py-20">
    <div className="text-center mb-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-primary mb-3">
        Loved across India
      </div>
      <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">What customers say</h2>
      <p className="text-muted-foreground mt-2">Real reviews from buyers in 28,000+ pincodes.</p>
    </div>

    <div className="grid md:grid-cols-3 gap-4 md:gap-6">
      {testimonials.map((t, i) => (
        <div key={t.name} className="glass rounded-2xl p-6 relative hover-glow group">
          <Quote className="absolute top-5 right-5 h-8 w-8 text-primary/15 group-hover:text-primary/30 transition-colors" />
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${colors[i]} flex items-center justify-center text-white font-bold text-sm shadow-glow`}>
              {t.initials}
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </div>
          </div>
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: t.rating }).map((_, k) => (
              <Star key={k} className="h-4 w-4 fill-warning text-warning" />
            ))}
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{t.text}</p>
        </div>
      ))}
    </div>
  </section>
);
