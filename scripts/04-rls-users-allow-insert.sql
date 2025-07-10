-- ENABLED TABLE: users
-- Allow anonymous sign-ups (role = 'user' or 'driver')
-- NOTE: keep stronger checks in production (captcha, rate-limit, etc.)

-- Remove any existing overly-strict insert policy
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create a new policy that lets anyone insert a user or driver row
CREATE POLICY "Public user signup"
  ON users
  FOR INSERT
  WITH CHECK (
    role IN ('user', 'driver')
  );

-- (Optional) still allow authenticated users to SELECT/UPDATE themselves
-- The earlier policies remain untouched.
