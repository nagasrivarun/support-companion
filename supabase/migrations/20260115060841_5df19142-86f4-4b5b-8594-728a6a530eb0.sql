-- Fix overly permissive satisfaction_ratings INSERT policy
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can submit ratings" ON public.satisfaction_ratings;

-- Create a more restrictive policy that requires a valid conversation_id
-- This ensures ratings can only be submitted for existing conversations
CREATE POLICY "Submit rating for valid conversation"
ON public.satisfaction_ratings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
  )
);

-- Add explicit SELECT policy for canned_responses (currently only has ALL for staff)
-- This ensures unauthenticated users cannot read canned responses
CREATE POLICY "Staff can view canned responses"
ON public.canned_responses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'agent'::app_role));