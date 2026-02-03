-- =====================================================
-- AI AUTOMATION TABLES
-- Stores webhook configs and automation logs
-- =====================================================

-- Automation webhooks configuration table
CREATE TABLE public.automation_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  webhook_type text NOT NULL CHECK (webhook_type IN ('order_notification', 'customer_support', 'abandoned_cart', 'product_recommendation', 'review_request')),
  webhook_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, webhook_type)
);

-- Automation logs for tracking webhook executions
CREATE TABLE public.automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES public.automation_webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  response_data jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Abandoned cart tracking
CREATE TABLE public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  customer_email text,
  cart_items jsonb NOT NULL DEFAULT '[]',
  total_amount numeric DEFAULT 0,
  currency_code text DEFAULT 'USD',
  abandoned_at timestamptz DEFAULT now(),
  recovered boolean DEFAULT false,
  recovery_email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Automation webhooks - staff only
CREATE POLICY "Staff can manage webhooks"
ON public.automation_webhooks FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

-- Automation logs - staff only
CREATE POLICY "Staff can view automation logs"
ON public.automation_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Staff can insert automation logs"
ON public.automation_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

-- Abandoned carts - users own, staff view all
CREATE POLICY "Users can view their own abandoned carts"
ON public.abandoned_carts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all abandoned carts"
ON public.abandoned_carts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Anyone can insert abandoned cart"
ON public.abandoned_carts FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update their cart"
ON public.abandoned_carts FOR UPDATE
TO anon, authenticated
USING (true);

-- Indexes for performance
CREATE INDEX idx_automation_webhooks_type ON public.automation_webhooks(webhook_type);
CREATE INDEX idx_automation_logs_webhook ON public.automation_logs(webhook_id);
CREATE INDEX idx_abandoned_carts_session ON public.abandoned_carts(session_id);
CREATE INDEX idx_abandoned_carts_user ON public.abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_abandoned ON public.abandoned_carts(abandoned_at) WHERE NOT recovered;