-- Add username field to existing profiles table
-- Run this in your Supabase SQL Editor

-- Add username column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;

-- Add is_online column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;

-- Add last_seen column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();

-- Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Update existing profiles with usernames based on email
UPDATE profiles 
SET username = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- For any profiles that still don't have usernames, generate them
UPDATE profiles 
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g')) || '_' || EXTRACT(EPOCH FROM created_at)::text
WHERE username IS NULL OR username = '';

-- Set NOT NULL constraint on username
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

-- Verify the changes
SELECT id, name, username, email FROM profiles LIMIT 5;
