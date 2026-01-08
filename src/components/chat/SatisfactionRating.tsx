import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SatisfactionRatingProps {
  conversationId: string;
  onComplete: () => void;
}

export function SatisfactionRating({ conversationId, onComplete }: SatisfactionRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Please select a rating',
        description: 'Click on a star to rate your experience',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('satisfaction_ratings').insert({
        conversation_id: conversationId,
        rating,
        feedback: feedback.trim() || null,
      });

      if (error) throw error;

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted.',
      });
      onComplete();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">How was your experience?</h3>
        <p className="text-sm text-muted-foreground">
          Please rate your conversation with us
        </p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors',
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/50'
              )}
            />
          </button>
        ))}
      </div>

      <div className="w-full space-y-2">
        <label className="text-sm font-medium text-foreground">
          Additional feedback (optional)
        </label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us more about your experience..."
          className="resize-none"
          rows={3}
        />
      </div>

      <div className="flex gap-2 w-full">
        <Button
          variant="ghost"
          onClick={onComplete}
          className="flex-1"
        >
          Skip
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit
        </Button>
      </div>
    </div>
  );
}
