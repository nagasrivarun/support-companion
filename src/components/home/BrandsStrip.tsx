import { useNavigate } from "react-router-dom";

interface Props { brands: string[] }

export const BrandsStrip = ({ brands }: Props) => {
  const navigate = useNavigate();
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Featured brands</h2>
        <p className="text-sm text-muted-foreground mt-1">Shop directly from verified Indian and global brands.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
        {brands.map(b => (
          <button
            key={b}
            onClick={() => navigate(`/shop?search=${encodeURIComponent(b)}`)}
            className="group relative px-5 py-2.5 rounded-full glass text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all duration-200 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative">{b}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
