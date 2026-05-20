import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarDisplayProps {
  rating: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const STAR_SIZES = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export function StarDisplay({ rating, size = "sm", className }: StarDisplayProps) {
  const filled = Math.floor(rating);
  return (
    <div className={cn("flex", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            STAR_SIZES[size],
            i <= filled ? "fill-warning text-warning" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

interface ReviewCountProps {
  count: number;
  className?: string;
  showLabel?: boolean;
}

export function ReviewCount({ count, className, showLabel = false }: ReviewCountProps) {
  return (
    <span className={cn("text-xs text-muted-foreground tabular-nums", className)}>
      ({count.toLocaleString("en-IN")}{showLabel ? " ratings" : ""})
    </span>
  );
}

interface RatingBlockProps {
  rating: number;
  reviewCount: number;
  size?: "xs" | "sm" | "md" | "lg";
  showCount?: boolean;
  showValue?: boolean;
  className?: string;
}

/**
 * Centralized rating display used by ProductCard, PDP and recommendation rails.
 * Keeps star sizing, color tokens and review-count formatting consistent.
 */
export function RatingBlock({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  showValue = true,
  className,
}: RatingBlockProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <StarDisplay rating={rating} size={size} />
      {showValue && (
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
      {showCount && <ReviewCount count={reviewCount} />}
    </div>
  );
}
