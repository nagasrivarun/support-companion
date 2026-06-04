import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { RatingBlock } from "@/components/product/RatingBlock";
import { formatINR } from "@/lib/pricing";
import { getRecPricing } from "@/data/recommendations";
import type { LocalProduct } from "@/data/products";

interface RecommendationCardProps {
  product: LocalProduct;
}

/**
 * Compact recommendation card: image, title, rating, price, discount.
 * Mobile-first, dark-theme aware, reuses canonical pricing tokens.
 */
export const RecommendationCard = ({ product }: RecommendationCardProps) => {
  const pricing = getRecPricing(product);

  return (
    <Link
      to={`/product/${product.handle}`}
      className="group block h-full rounded-xl border border-border/60 bg-card/60 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_hsl(217_100%_60%/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${product.title} — ${formatINR(pricing.price)}`}
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        {pricing.discountPercent > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 shadow">
            {pricing.discountPercent}% OFF
          </Badge>
        )}
      </div>
      <div className="p-2.5 sm:p-3 space-y-1">
        <h3 className="font-medium text-foreground text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2.25rem] group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <RatingBlock rating={product.rating} reviewCount={product.reviewCount} size="xs" showCount={false} />
        <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
          <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {formatINR(pricing.price)}
          </span>
          {pricing.originalPrice && (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatINR(pricing.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
