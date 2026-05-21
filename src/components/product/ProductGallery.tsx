import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  activeImage: string;
  thumbnails?: string[];
  variantImages?: string[];
  alt: string;
  discountPercent?: number;
}

/**
 * Premium product gallery:
 * - Real image swap (NO CSS tinting)
 * - Hover-zoom on desktop, touch-swipe on mobile
 * - Shimmer skeleton placeholder, fade-in on load
 * - Idle-preload of nearby variants for instant swap
 * - Fixed aspect-square = zero CLS
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
  const [zoom, setZoom] = useState<{ x: number; y: number; on: boolean }>({
    x: 50,
    y: 50,
    on: false,
  });
  const prev = useRef(activeImage);
  const touchStartX = useRef<number | null>(null);

  // Preload nearby variant images
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

  // Crossfade when activeImage changes
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      on: true,
    });
  };

  const swipeTo = (dir: 1 | -1) => {
    if (allThumbs.length < 2) return;
    const idx = allThumbs.indexOf(displayed);
    const next = (idx + dir + allThumbs.length) % allThumbs.length;
    setDisplayed(allThumbs[next]);
  };

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-muted/40 to-muted/10 border border-border/60 cursor-zoom-in group/zoom"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 50) swipeTo(dx < 0 ? 1 : -1);
          touchStartX.current = null;
        }}
      >
        {!loaded && <div className="absolute inset-0 shimmer rounded-2xl" />}
        <img
          src={displayed}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={
            zoom.on
              ? {
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  transform: "scale(1.8)",
                }
              : undefined
          }
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out will-change-transform",
            fading || !loaded ? "opacity-0 scale-[1.02]" : "opacity-100",
            !zoom.on && "group-hover/zoom:scale-[1.03]"
          )}
        />
        {discountPercent > 0 && loaded && (
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 z-10 shadow-lg animate-in fade-in zoom-in-95">
            {discountPercent}% OFF
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur-md border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground opacity-0 group-hover/zoom:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="h-3 w-3" /> Hover to zoom
        </div>
      </div>

      {allThumbs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
