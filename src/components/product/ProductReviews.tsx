import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, ThumbsUp, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

interface ProductReviewsProps {
  productHandle: string;
  productTitle: string;
}

const reviewSchema = z.object({
  title: z.string().trim().max(100, "Title must be less than 100 characters").optional(),
  content: z.string().trim().max(1000, "Review must be less than 1000 characters").optional(),
  rating: z.number().min(1).max(5)
});

export const ProductReviews = ({ productHandle, productTitle }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productHandle]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_handle", productHandle)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
      
      if (user) {
        const existingReview = data?.find(r => r.user_id === user.id);
        setUserReview(existingReview || null);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      const { error } = await supabase
        .from("product_reviews")
        .insert({
          user_id: user.id,
          product_handle: productHandle,
          product_title: productTitle,
          rating,
          title: title.trim() || null,
          content: content.trim() || null
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
      if (error.code === "23505") {
        toast.error("You've already reviewed this product");
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 
      : 0
  }));

  const renderStars = (rating: number, interactive = false, size = "h-5 w-5") => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          >
            <Star
              className={`${size} ${
                star <= (interactive ? (hoverRating || rating) : rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Rating Summary */}
        <div className="md:w-1/3 space-y-4">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-8">{stars}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </div>

          {user && !userReview && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="w-full mt-4"
              variant={showForm ? "outline" : "default"}
            >
              {showForm ? "Cancel" : "Write a Review"}
            </Button>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground text-center md:text-left">
              <a href="/auth" className="text-primary hover:underline">Sign in</a> to leave a review
            </p>
          )}
        </div>

        {/* Reviews List */}
        <div className="md:w-2/3">
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-4">Write Your Review</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Rating *</label>
                {renderStars(rating, true, "h-8 w-8")}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Title (optional)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={100}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Review (optional)</label>
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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating, false, "h-4 w-4")}
                        {review.verified_purchase && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-semibold text-foreground">{review.title}</h4>
                      )}
                      {review.content && (
                        <p className="text-muted-foreground mt-1">{review.content}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                          Helpful ({review.helpful_count})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
