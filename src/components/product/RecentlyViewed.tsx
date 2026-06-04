import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { RecommendationCard } from "@/components/product/RecommendationCard";
import { useBrowsingHistory } from "@/stores/browsingHistory";
import { LOCAL_PRODUCTS, type LocalProduct } from "@/data/products";

interface RecentlyViewedProps {
  /** Exclude this handle (e.g. the product currently being viewed). */
  excludeHandle?: string;
  title?: string;
  /** Show deterministic mock products when there is no real history yet. */
  fallback?: boolean;
}

// Deterministic mock fallback — stable, top-rated picks (no randomness, SSR-safe).
const getFallbackProducts = (limit: number, excludeHandle?: string): LocalProduct[] =>
  [...LOCAL_PRODUCTS]
    .filter((p) => p.handle !== excludeHandle)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);

/**
 * Recently Viewed Products — responsive horizontal carousel.
 * Reads persisted, 30-day-expiring history from localStorage and falls back
 * to deterministic top-rated picks for first-time visitors.
 */
export const RecentlyViewed = ({
  excludeHandle,
  title = "Recently Viewed",
  fallback = true,
}: RecentlyViewedProps) => {
  const viewedHandles = useBrowsingHistory((s) => s.viewedHandles);
  const scrollRef = useRef<HTMLDivElement>(null);

  const products = useMemo(() => {
    const real = viewedHandles
      .filter((h) => h !== excludeHandle)
      .map((h) => LOCAL_PRODUCTS.find((p) => p.handle === h))
      .filter((p): p is LocalProduct => Boolean(p));

    if (real.length > 0) return real.slice(0, 20);
    return fallback ? getFallbackProducts(12, excludeHandle) : [];
  }, [viewedHandles, excludeHandle, fallback]);

  if (products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section
      className="mt-16 border-t border-border pt-12"
      aria-labelledby="recently-viewed-heading"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 id="recently-viewed-heading" className="text-xl md:text-2xl font-bold text-foreground">
          {title}
        </h2>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-r-md p-2 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x"
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="snap-start shrink-0 w-[150px] sm:w-[180px] lg:w-[200px]"
            >
              <RecommendationCard product={p} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 border border-border shadow-lg rounded-l-md p-2 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </section>
  );
};
