-- Add unique constraint to prevent multiple ratings per conversation
ALTER TABLE public.satisfaction_ratings 
ADD CONSTRAINT unique_rating_per_conversation 
UNIQUE (conversation_id);