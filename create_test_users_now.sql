-- Create test users for immediate testing
-- Run this in your Supabase SQL Editor

-- First, let's add the username column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Create test users with proper UUIDs
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

SELECT 'Test users created successfully! You can now search for users to chat with.' as status;
