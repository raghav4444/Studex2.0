-- Add community access level to profiles for verification-based access control
-- full = verified, full access; partial = limited write; read_only = view only

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS access_level text DEFAULT 'full'
  CHECK (access_level IN ('full', 'partial', 'read_only'));

-- Backfill: verified users get full, others get read_only
UPDATE profiles
SET access_level = CASE
  WHEN is_verified THEN 'full'
  ELSE 'read_only'
END
WHERE access_level IS NULL;

COMMENT ON COLUMN profiles.access_level IS 'Community access: full (verified), partial (limited write), read_only (view only)';
