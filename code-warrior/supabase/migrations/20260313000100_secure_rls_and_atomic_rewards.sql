-- NOTE:
-- This file is intentionally minimal after rollout.
-- The original large migration had to be split because Supabase CLI (v2.67.1)
-- rejected multi-command prepared statements during db push.
-- Keep this migration for history integrity because it has already been applied.

CREATE OR REPLACE FUNCTION requesting_github_id()
RETURNS TEXT AS $$
  SELECT COALESCE(auth.jwt() ->> 'sub', '');
$$ LANGUAGE sql STABLE;