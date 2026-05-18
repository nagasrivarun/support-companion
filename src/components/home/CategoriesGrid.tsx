import { Link } from "react-router-dom";
import {
  Shirt, Footprints, Headphones, Smartphone, Backpack, Watch,
  Laptop, Home, UtensilsCrossed, Dumbbell, BookOpen, Sparkles,
} from "lucide-react";

const categories = [
  { name: "Clothing", icon: Shirt, q: "Clothing", gradient: "from-blue-500/20 to-cyan-500/20" },
  { name: "Footwear", icon: Footprints, q: "Footwear", gradient: "from-cyan-500/20 to-blue-500/20" },
  { name: "Audio", icon: Headphones, q: "Audio", gradient: "from-indigo-500/20 to-blue-500/20" },
  { name: "Phones", icon: Smartphone, q: "Phones %26 Tablets", gradient: "from-blue-500/20 to-indigo-500/20" },
  { name: "Bags", icon: Backpack, q: "Bags", gradient: "from-sky-500/20 to-cyan-500/20" },
  { name: "Watches", icon: Watch, q: "Wearable Tech", gradient: "from-cyan-500/20 to-sky-500/20" },
  { name: "Laptops", icon: Laptop, q: "Computers %26 Laptops", gradient: "from-blue-500/20 to-cyan-500/20" },
  { name: "Home", icon: Home, q: "Home Decor", gradient: "from-indigo-500/20 to-blue-500/20" },
  { name: "Kitchen", icon: UtensilsCrossed, q: "Kitchen Appliances", gradient: "from-sky-500/20 to-blue-500/20" },
  { name: "Fitness", icon: Dumbbell, q: "Sports %26 Fitness", gradient: "from-cyan-500/20 to-indigo-500/20" },
  { name: "Books", icon: BookOpen, q: "Books", gradient: "from-blue-500/20 to-sky-500/20" },
  { name: "Beauty", icon: Sparkles, q: "Beauty %26 Personal Care", gradient: "from-indigo-500/20 to-cyan-500/20" },
];

export const CategoriesGrid = () => (
  <section className="container mx-auto px-4 py-12 md:py-16">
    <div className="flex items-end justify-between mb-6 md:mb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Shop by category
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Curated essentials across every aisle.</p>
      </div>
      <Link to="/shop" className="hidden sm:inline text-sm text-primary hover:underline">
        View all →
      </Link>
    </div>

    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
      {categories.map(c => (
        <Link
          key={c.name}
          to={`/shop?category=${c.q}`}
          className="group relative overflow-hidden rounded-2xl glass p-4 md:p-5 flex flex-col items-center text-center hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className="relative z-10 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-2 transition-colors">
            <c.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <span className="relative z-10 text-xs md:text-sm font-semibold text-foreground">{c.name}</span>
        </Link>
      ))}
    </div>
  </section>
);
