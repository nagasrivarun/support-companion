
CREATE TABLE public.return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_number text NOT NULL,
  product_title text NOT NULL,
  product_handle text,
  return_reason text NOT NULL,
  return_type text NOT NULL DEFAULT 'refund',
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own returns" ON public.return_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own returns" ON public.return_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all returns" ON public.return_requests
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'agent')
  );

CREATE POLICY "Staff can update returns" ON public.return_requests
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'agent')
  );
