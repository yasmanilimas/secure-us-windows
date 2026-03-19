
-- 1. ESTIMATES: Restrict the anon INSERT policy to only allow inserting with limited fields
-- Drop the overly permissive anon INSERT and replace with a more restrictive one
DROP POLICY IF EXISTS "Anyone can submit an estimate" ON public.estimates;
CREATE POLICY "Anyone can submit an estimate"
  ON public.estimates FOR INSERT
  TO anon
  WITH CHECK (
    lead_id IS NOT NULL
  );

-- 2. LEADS: Restrict the anon INSERT policy to require email (not empty inserts)
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL AND email <> ''
  );

-- 3. PROFILES: Add admin SELECT policy so admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
