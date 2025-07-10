-- ------------------------------------------------------------------
-- Allow PUBLIC sign-up into the public.users table (dev / demo use)
-- ------------------------------------------------------------------

-- Make sure RLS is enabled (required for the policy to work)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remove any earlier INSERT policies that may conflict
DROP POLICY IF EXISTS "Public user signup"       ON public.users;
DROP POLICY IF EXISTS "Users can insert"         ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

-- Permissive INSERT policy ­– allows every role (anon or authenticated)
CREATE POLICY "Allow anyone to insert (signup)"
  ON public.users
  FOR INSERT
  WITH CHECK (true);   -- every new row is allowed

-- You can keep your existing SELECT/UPDATE policies unchanged
