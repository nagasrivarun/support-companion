import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, ThumbsUp, User, Loader2, ShieldCheck, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { StarDisplay } from "@/components/product/RatingBlock";
import {
  generateReviews,
  computeReviewStats,
  type MockReview,
} from "@/data/reviews";

interface ProductReviewsProps {
  productHandle: string;
  productTitle: string;
  baseRating?: number;
  baseReviewCount?: number;
  productImages?: string[];
}

type SortKey = "recent" | "highest" | "lowest" | "helpful";

const reviewSchema = z.object({
  title: z.string().trim().max(100, "Title must be less than 100 characters").optional(),
  content: z.string().trim().max(1000, "Review must be less than 1000 characters").optional(),
  rating: z.number().min(1).max(5),
});

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const ProductReviews = ({
  productHandle,
  productTitle,
  baseRating = 4.3,
  baseReviewCount = 0,
  productImages = [],
}: ProductReviewsProps) => {
  const { user } = useAuth();
  const [realReviews, setRealReviews] = useState<MockReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasUserReview, setHasUserReview] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Deterministic mock reviews seeded from the product handle.
  const mockReviews = useMemo(
    () => generateReviews(productHandle, baseRating, baseReviewCount, productImages),
    [productHandle, baseRating, baseReviewCount, productImages]
  );

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productHandle]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_handle", productHandle)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: MockReview[] = (data || []).map((r) => ({
        id: r.id,
        name: "Verified Customer",
        rating: r.rating,
        date: r.created_at,
        title: r.title || "Verified review",
        content: r.content || "",
        verified: r.verified_purchase,
        helpful: r.helpful_count,
        photos: [],
        aspects: { quality: r.rating, value: r.rating, delivery: 5 },
      }));

      setRealReviews(mapped);
      if (user) setHasUserReview((data || []).some((r) => r.user_id === user.id));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const allReviews = useMemo(
    () => [...realReviews, ...mockReviews],
    [realReviews, mockReviews]
  );

  const stats = useMemo(
    () => computeReviewStats(allReviews, baseReviewCount),
    [allReviews, baseReviewCount]
  );

  const photoReviews = useMemo(
    () => allReviews.filter((r) => r.photos.length > 0),
    [allReviews]
  );
  const allPhotos = useMemo(
    () => photoReviews.flatMap((r) => r.photos),
    [photoReviews]
  );

  const sortedReviews = useMemo(() => {
    const copy = [...allReviews];
    switch (sort) {
      case "highest":
        return copy.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return copy.sort((a, b) => a.rating - b.rating);
      case "helpful":
        return copy.sort((a, b) => b.helpful - a.helpful);
      case "recent":
      default:
        return copy.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
  }, [allReviews, sort]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }
    const validation = reviewSchema.safeParse({ rating, title, content });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("product_reviews").insert({
        user_id: user.id,
        product_handle: productHandle,
        product_title: productTitle,
        rating,
        title: title.trim() || null,
        content: content.trim() || null,
      });
      if (error) throw error;
      toast.success("Review submitted successfully!");
      setShowForm(false);
      setRating(0);
      setTitle("");
      setContent("");
      fetchReviews();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      if (error.code === "23505") toast.error("You've already reviewed this product");
      else toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormStars = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <Star
            className={cn(
              "h-8 w-8 transition-colors",
              star <= (hoverRating || rating)
                ? "fill-warning text-warning"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SEO: Review schema for the displayed customer reviews */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            sortedReviews.slice(0, 12).map((r) => ({
              "@context": "https://schema.org",
              "@type": "Review",
              itemReviewed: { "@type": "Product", name: productTitle },
              author: { "@type": "Person", name: r.name },
              datePublished: r.date.slice(0, 10),
              reviewBody: r.content,
              name: r.title,
              reviewRating: {
                "@type": "Rating",
                ratingValue: r.rating,
                bestRating: 5,
                worstRating: 1,
              },
            }))
          ),
        }}
      />

      {/* Summary + distribution + aspect statistics */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Average */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 p-6 text-center">
          <div className="text-5xl font-bold text-foreground tabular-nums">
            {stats.average.toFixed(1)}
          </div>
          <StarDisplay rating={Math.round(stats.average)} size="lg" className="mt-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {stats.total.toLocaleString("en-IN")} ratings
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <ShieldCheck className="h-3.5 w-3.5" />
            {Math.round(stats.verifiedPercentage)}% verified
          </div>
        </div>

        {/* Distribution */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Rating breakdown</h3>
          <div className="space-y-2.5">
            {stats.distribution.map(({ stars, count, percentage }) => (
              <button
                key={stars}
                onClick={() => setSort(stars >= 4 ? "highest" : "lowest")}
                className="flex w-full items-center gap-3 group"
                aria-label={`${stars} star reviews: ${count}`}
              >
                <span className="flex w-10 items-center gap-1 text-sm text-muted-foreground tabular-nums">
                  {stars}
                  <Star className="h-3 w-3 fill-warning text-warning" />
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-warning transition-all group-hover:bg-warning/80"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm text-muted-foreground tabular-nums">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect statistics */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">What customers rate</h3>
          <div className="space-y-4">
            {[
              { label: "Quality", value: stats.aspects.quality },
              { label: "Value for money", value: stats.aspects.value },
              { label: "Delivery experience", value: stats.aspects.delivery },
            ].map((a) => (
              <div key={a.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{a.label}</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {a.value.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(a.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer photos */}
      {allPhotos.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Customer photos ({allPhotos.length})
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {allPhotos.map((src, i) => (
              <button
                key={`${src}-${i}`}
                onClick={() => setLightbox(src)}
                className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-24 sm:w-24"
                aria-label="Enlarge customer photo"
              >
                <img
                  src={src}
                  alt={`Customer photo ${i + 1} of ${productTitle}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="highest">Highest rating</SelectItem>
              <SelectItem value="lowest">Lowest rating</SelectItem>
              <SelectItem value="helpful">Most helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {user && !hasUserReview && (
          <Button
            onClick={() => setShowForm((s) => !s)}
            variant={showForm ? "outline" : "default"}
            className="sm:w-auto"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
        {!user && (
          <p className="text-sm text-muted-foreground">
            <a href="/auth" className="text-primary hover:underline">
              Sign in
            </a>{" "}
            to leave a review
          </p>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-muted/40 p-5"
        >
          <h3 className="mb-4 font-semibold text-foreground">Write your review</h3>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">Rating *</label>
            {renderFormStars()}
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Title (optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Review (optional)
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={4}
              maxLength={1000}
            />
          </div>
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      )}

      {/* Review cards */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-border bg-card/40 p-5 transition-colors hover:border-border/80"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-foreground">{review.name}</span>
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                      <ShieldCheck className="h-3 w-3" /> Verified Purchase
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StarDisplay rating={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">{formatDate(review.date)}</span>
                </div>

                {review.title && (
                  <h4 className="mt-2 font-semibold text-foreground">{review.title}</h4>
                )}
                {review.content && (
                  <p className="mt-1 leading-relaxed text-muted-foreground">{review.content}</p>
                )}

                {review.photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.photos.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        onClick={() => setLightbox(src)}
                        className="h-16 w-16 overflow-hidden rounded-lg border border-border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Enlarge review photo"
                      >
                        <img
                          src={src}
                          alt={`${review.name}'s photo ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <button className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Photo lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl border-border bg-card p-2 sm:p-4">
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 text-foreground transition-colors hover:bg-background"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {lightbox && (
            <img
              src={lightbox}
              alt={`Enlarged customer photo of ${productTitle}`}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
