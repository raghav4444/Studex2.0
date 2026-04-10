-- Complete CampusLink Database Setup
-- Run this ENTIRE script in your Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing profiles table if it exists (to start fresh)
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Create profiles table with proper constraints
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  college text NOT NULL,
  branch text NOT NULL,
  year integer NOT NULL,
  bio text DEFAULT '',
  avatar_url text,
  skills text[] DEFAULT '{}',
  achievements text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Create your specific profile (replace user_id with your actual ID from the console)
INSERT INTO profiles (
  user_id,
  name,
  email,
  college,
  branch,
  year,
  bio,
  is_verified,
  is_anonymous
) VALUES (
  '8053d081-c4da-4779-8e54-a8b06d48e306',
  '2023bcs065',
  '2023bcs065@axiscolleges.in',
  'Axis Colleges',
  'Computer Science',
  2023,
  'Student at Axis Colleges',
  true,
  false
);

-- 7. Verify everything worked
SELECT 
  'Table created successfully' as status,
  count(*) as profile_count
FROM profiles;

SELECT 
  id,
  user_id,
  name,
  email,
  college,
  branch,
  year,
  is_verified,
  created_at
FROM profiles 
WHERE user_id = '8053d081-c4da-4779-8e54-a8b06d48e306';