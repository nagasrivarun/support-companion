-- =====================================================
-- SECURITY HARDENING MIGRATION
-- Fixes exposed customer data and overly permissive RLS
-- =====================================================

-- 1. PROFILES TABLE - Restrict to own profile only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. CUSTOMER_ADDRESSES - Ensure only owner can access
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.customer_addresses;

CREATE POLICY "Users can view their own addresses"
ON public.customer_addresses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
ON public.customer_addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
ON public.customer_addresses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
ON public.customer_addresses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. ORDERS - Only staff (admin/agent) can view all, customers see their own
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

-- Add user_id column to orders if not exists for customer order tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'user_id') THEN
    ALTER TABLE public.orders ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

CREATE POLICY "Staff can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

-- 4. CONVERSATIONS - Only staff can access
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Staff can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Staff can update conversations" ON public.conversations;

CREATE POLICY "Staff can view conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Authenticated can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

-- 5. MESSAGES - Only staff can access
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Staff can view messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated can insert messages" ON public.messages;

CREATE POLICY "Staff can view messages"
ON public.messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Authenticated can insert messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. NEWSLETTER_SUBSCRIBERS - Only staff can view, anyone can subscribe
DROP POLICY IF EXISTS "Anyone can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Staff can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

CREATE POLICY "Staff can view subscribers"
ON public.newsletter_subscribers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 7. USER_ROLES - Users see own role, admins see all
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. CANNED_RESPONSES - Only staff can access
DROP POLICY IF EXISTS "Anyone can view canned responses" ON public.canned_responses;
DROP POLICY IF EXISTS "Anyone can manage canned responses" ON public.canned_responses;
DROP POLICY IF EXISTS "Staff can view canned responses" ON public.canned_responses;
DROP POLICY IF EXISTS "Staff can manage canned responses" ON public.canned_responses;

CREATE POLICY "Staff can view canned responses"
ON public.canned_responses FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Staff can manage canned responses"
ON public.canned_responses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

-- 9. SATISFACTION_RATINGS - Only staff can view
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.satisfaction_ratings;
DROP POLICY IF EXISTS "Anyone can insert ratings" ON public.satisfaction_ratings;
DROP POLICY IF EXISTS "Staff can view ratings" ON public.satisfaction_ratings;
DROP POLICY IF EXISTS "Authenticated can submit ratings" ON public.satisfaction_ratings;

CREATE POLICY "Staff can view ratings"
ON public.satisfaction_ratings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Authenticated can submit ratings"
ON public.satisfaction_ratings FOR INSERT
TO authenticated
WITH CHECK (true);

-- 10. PRODUCT_REVIEWS - Public read, authenticated write own
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.product_reviews;

CREATE POLICY "Anyone can view reviews"
ON public.product_reviews FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can create their own reviews"
ON public.product_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.product_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.product_reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index on orders.user_id for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);