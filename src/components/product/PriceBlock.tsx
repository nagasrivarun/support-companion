import { Badge } from "@/components/ui/badge";
import { formatINR, estimateEmi, type NormalizedPrice } from "@/lib/pricing";

interface PriceBlockProps {
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  size?: "sm" | "md" | "lg";
  showMeta?: boolean;
}

export function PriceBlock({
  price,
  originalPrice,
  discountPercent,
  size = "lg",
  showMeta = true,
}: PriceBlockProps) {
  const sizes = {
    sm: { current: "text-lg", mrp: "text-xs" },
    md: { current: "text-2xl", mrp: "text-sm" },
    lg: { current: "text-3xl md:text-4xl", mrp: "text-base" },
  }[size];

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <span className={`${sizes.current} font-bold tracking-tight text-foreground`}>
          {formatINR(price)}
        </span>
        {originalPrice && originalPrice > price && (
          <>
            <span className={`${sizes.mrp} text-muted-foreground line-through`}>
              {formatINR(originalPrice)}
            </span>
            <Badge className="bg-success/15 text-success border border-success/30 font-semibold animate-in fade-in zoom-in-95">
              {discountPercent}% OFF
            </Badge>
          </>
        )}
      </div>
      {showMeta && (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>Inclusive of all taxes</p>
          {price >= 3000 && <p>EMI from {formatINR(estimateEmi(price))}/month</p>}
        </div>
      )}
    </div>
  );
}

export function priceFromNormalized(np: NormalizedPrice) {
  return {
    price: np.price,
    originalPrice: np.originalPrice,
    discountPercent: np.discountPercent,
  };
}
