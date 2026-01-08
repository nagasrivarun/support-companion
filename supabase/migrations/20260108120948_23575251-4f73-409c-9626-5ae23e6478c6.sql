-- Create satisfaction_ratings table
CREATE TABLE public.satisfaction_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satisfaction_ratings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert ratings (customers aren't authenticated)
CREATE POLICY "Anyone can submit ratings"
ON public.satisfaction_ratings
FOR INSERT
WITH CHECK (true);

-- Staff can view all ratings
CREATE POLICY "Staff can view ratings"
ON public.satisfaction_ratings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'agent'::app_role));

-- Create canned_responses table
CREATE TABLE public.canned_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  shortcut TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;

-- Staff can manage canned responses
CREATE POLICY "Staff can manage canned responses"
ON public.canned_responses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'agent'::app_role));

-- Add resolved_at and first_response_at columns to conversations for analytics
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE;