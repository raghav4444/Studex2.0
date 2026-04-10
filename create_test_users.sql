-- Create test users for chat functionality
-- Run this in your Supabase SQL Editor after setting up the chat tables

-- First, let's create some test profiles
-- Note: These will have dummy user_ids since we can't create auth users via SQL

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
  'test-user-1',
  'Alice Johnson',
  'alicejohnson',
  'alice.johnson@axiscolleges.in',
  'Axis Colleges',
  'Computer Science',
  2023,
  'Passionate about web development and machine learning. Love to help fellow students!',
  NULL,
  ARRAY['JavaScript', 'React', 'Python', 'Machine Learning'],
  ARRAY['Hackathon Winner 2023', 'Dean''s List'],
  true,
  false,
  NOW(),
  NOW()
),
(
  'test-user-2',
  'Bob Smith',
  'bobsmith',
  'bob.smith@axiscolleges.in',
  'Axis Colleges',
  'Information Technology',
  2023,
  'Full-stack developer with experience in React and Node.js. Always up for a coding challenge!',
  NULL,
  ARRAY['React', 'Node.js', 'MongoDB', 'AWS'],
  ARRAY['Best Project Award', 'Tech Lead'],
  true,
  false,
  NOW(),
  NOW()
),
(
  'test-user-3',
  'Charlie Brown',
  'charliebrown',
  'charlie.brown@axiscolleges.in',
  'Axis Colleges',
  'Computer Science',
  2023,
  'Mobile app developer and UI/UX enthusiast. Love creating beautiful interfaces!',
  NULL,
  ARRAY['Flutter', 'React Native', 'Figma', 'Swift'],
  ARRAY['App Store Featured', 'Design Excellence Award'],
  true,
  false,
  NOW(),
  NOW()
),
(
  'test-user-4',
  'Diana Prince',
  'dianaprince',
  'diana.prince@axiscolleges.in',
  'Axis Colleges',
  'Data Science',
  2023,
  'Data scientist with expertise in Python and machine learning. Love analyzing patterns!',
  NULL,
  ARRAY['Python', 'TensorFlow', 'SQL', 'Statistics'],
  ARRAY['Research Paper Published', 'Data Science Competition Winner'],
  true,
  false,
  NOW(),
  NOW()
),
(
  'test-user-5',
  'Eve Wilson',
  'evewilson',
  'eve.wilson@axiscolleges.in',
  'Axis Colleges',
  'Cyber Security',
  2023,
  'Cybersecurity enthusiast and ethical hacker. Passionate about protecting digital assets!',
  NULL,
  ARRAY['Penetration Testing', 'Network Security', 'Linux', 'Cryptography'],
  ARRAY['Security Certification', 'Bug Bounty Hunter'],
  true,
  false,
  NOW(),
  NOW()
);

-- Update username field to be unique (in case it wasn't set properly)
UPDATE profiles SET username = 'alicejohnson' WHERE email = 'alice.johnson@axiscolleges.in';
UPDATE profiles SET username = 'bobsmith' WHERE email = 'bob.smith@axiscolleges.in';
UPDATE profiles SET username = 'charliebrown' WHERE email = 'charlie.brown@axiscolleges.in';
UPDATE profiles SET username = 'dianaprince' WHERE email = 'diana.prince@axiscolleges.in';
UPDATE profiles SET username = 'evewilson' WHERE email = 'eve.wilson@axiscolleges.in';

-- Verify the insertion
SELECT 
  name,
  username,
  email,
  college,
  branch,
  year,
  is_verified
FROM profiles 
WHERE email LIKE '%@axiscolleges.in'
ORDER BY name;

SELECT 'Test users created successfully! You can now search for users to chat with.' as status;
