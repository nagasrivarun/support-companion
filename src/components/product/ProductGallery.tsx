import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  /** Primary image — switches when color variant changes */
  activeImage: string;
  /** Static thumbnails (e.g. product.images) */
  thumbnails?: string[];
  /** Additional images for nearby variants to preload */
  variantImages?: string[];
  alt: string;
  discountPercent?: number;
}

/**
 * Apple-style product gallery:
 * - Real image swap (NO CSS tinting / hue-rotate / blend modes)
 * - Smooth crossfade + subtle scale on variant change
 * - Lazy loading thumbnails, eager LCP main image
 * - Skeleton placeholder until first paint, fade-in on load
 * - Preloads nearby variant images for instant swap
 * - Fixed aspect ratio = no CLS
 */
export function ProductGallery({
  activeImage,
  thumbnails = [],
  variantImages = [],
  alt,
  discountPercent = 0,
}: ProductGalleryProps) {
  const allThumbs = useMemo(() => {
    const set = new Set<string>([activeImage, ...thumbnails]);
    return Array.from(set);
  }, [activeImage, thumbnails]);

  const [displayed, setDisplayed] = useState(activeImage);
  const [fading, setFading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const prev = useRef(activeImage);

  // Preload nearby variant images (idle) so swaps are instant + flicker-free
  useEffect(() => {
    const idle = (cb: () => void) =>
      "requestIdleCallback" in window
        ? (window as any).requestIdleCallback(cb)
        : setTimeout(cb, 200);
    idle(() => {
      [...allThumbs, ...variantImages].forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      });
    });
  }, [allThumbs, variantImages]);

  // Crossfade when activeImage changes — preload then swap
  useEffect(() => {
    if (prev.current === activeImage) return;
    setFading(true);
    const pre = new Image();
    pre.src = activeImage;
    const swap = () => {
      setDisplayed(activeImage);
      requestAnimationFrame(() => setFading(false));
      prev.current = activeImage;
    };
    if (pre.complete) swap();
    else pre.onload = swap;
  }, [activeImage]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-muted/40 to-muted/10 border border-border/60">
        {!loaded && (
          <Skeleton className="absolute inset-0 h-full w-full rounded-2xl" />
        )}
        <img
          src={displayed}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out will-change-transform",
            fading || !loaded ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
          )}
        />
        {discountPercent > 0 && loaded && (
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 z-10 shadow-lg animate-in fade-in zoom-in-95">
            {discountPercent}% OFF
          </Badge>
        )}
      </div>

      {allThumbs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allThumbs.map((src) => {
            const active = src === displayed;
            return (
              <button
                key={src}
                onClick={() => setDisplayed(src)}
                aria-label="View image"
                className={cn(
                  "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted transition-all duration-200",
                  active
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "ring-1 ring-border hover:ring-primary/40"
                )}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
