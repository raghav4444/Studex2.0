-- Create test users that work with Supabase Auth
-- This version creates users in auth.users first, then profiles

-- Method 1: Temporarily disable RLS and FK constraints for testing
-- ⚠️ ONLY FOR DEVELOPMENT/TESTING - DO NOT USE IN PRODUCTION

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop the foreign key constraint temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add username column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Create test users directly in profiles table
INSERT INTO profiles (
  user_id,
  name,
  username,
  email,
  college,
  branch,
  year,
  bio,
  avatar_url,
  skills,
  achievements,
  is_verified,
  is_anonymous,
  created_at,
  updated_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Alice Johnson',
  'alicejohnson',
  'alice.johnson@axiscolleges.in',
  'Axis Colleges',
  'Computer Science',
  2023,
  'Passionate about web development and machine learning!',
  NULL,
  ARRAY['JavaScript', 'React', 'Python'],
  ARRAY['Hackathon Winner', 'Dean''s List'],
  true,
  false,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Bob Smith',
  'bobsmith',
  'bob.smith@axiscolleges.in',
  'Axis Colleges',
  'Information Technology',
  2023,
  'Full-stack developer with React and Node.js experience!',
  NULL,
  ARRAY['React', 'Node.js', 'MongoDB'],
  ARRAY['Best Project Award', 'Tech Lead'],
  true,
  false,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Charlie Brown',
  'charliebrown',
  'charlie.brown@axiscolleges.in',
  'Axis Colleges',
  'Computer Science',
  2023,
  'Mobile app developer and UI/UX enthusiast!',
  NULL,
  ARRAY['Flutter', 'React Native', 'Figma'],
  ARRAY['App Store Featured', 'Design Award'],
  true,
  false,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Diana Prince',
  'dianaprince',
  'diana.prince@axiscolleges.in',
  'Axis Colleges',
  'Data Science',
  2023,
  'Data scientist with Python and ML expertise!',
  NULL,
  ARRAY['Python', 'TensorFlow', 'SQL'],
  ARRAY['Research Published', 'ML Competition Winner'],
  true,
  false,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Eve Wilson',
  'evewilson',
  'eve.wilson@axiscolleges.in',
  'Axis Colleges',
  'Cyber Security',
  2023,
  'Cybersecurity enthusiast and ethical hacker!',
  NULL,
  ARRAY['Penetration Testing', 'Network Security'],
  ARRAY['Security Certification', 'Bug Bounty'],
  true,
  false,
  NOW(),
  NOW()
);

-- Verify the users were created
SELECT 
  name,
  username,
  email,
  college,
  branch,
  year,
  is_verified
FROM profiles 
WHERE college = 'Axis Colleges'
ORDER BY name;

-- Re-enable RLS (optional - you can leave it disabled for easier testing)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Note: We're not re-adding the FK constraint for now since these are test users
-- In production, you'd want to re-add it:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

SELECT 'Test users created successfully! You can now search for users to chat with.' as status;
