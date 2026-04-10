/*
  # Initial CampusLink Database Schema

  1. New Tables
    - `profiles` - User profiles with college verification
    - `posts` - User posts and content sharing
    - `notes` - Study materials and notes library
    - `events` - Campus events and activities
    - `study_groups` - Collaborative learning groups
    - `jobs` - Job postings and internships
    - `mentorship_requests` - Mentor-mentee connections
    - `notifications` - User notifications system
    - `resumes` - Resume builder data
    - `resume_templates` - Resume templates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure file uploads and downloads
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  college text NOT NULL,
  branch text NOT NULL,
  year integer NOT NULL,
  bio text,
  avatar_url text,
  skills text[],
  achievements text[],
  is_verified boolean DEFAULT false,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  file_url text,
  file_name text,
  file_type text,
  is_anonymous boolean DEFAULT false,
  scope text DEFAULT 'college' CHECK (scope IN ('college', 'global')),
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL,
  semester text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  downloads integer DEFAULT 0,
  likes integer DEFAULT 0,
  tags text[],
  description text,
  created_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  max_attendees integer,
  is_online boolean DEFAULT false,
  meeting_link text,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Study Groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  max_members integer NOT NULL,
  is_private boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  poster_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('internship', 'full-time', 'part-time')),
  description text NOT NULL,
  requirements text[],
  salary text,
  applications integer DEFAULT 0,
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Mentorship Requests table
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Resume Templates table
CREATE TABLE IF NOT EXISTS resume_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL,
  preview_url text,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES resume_templates(id),
  title text NOT NULL,
  resume_data jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event Attendees junction table
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Study Group Members junction table
CREATE TABLE IF NOT EXISTS study_group_members (
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Post Likes junction table
CREATE TABLE IF NOT EXISTS post_likes (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Note Likes junction table
CREATE TABLE IF NOT EXISTS note_likes (
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (note_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view all posts" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view all notes" ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create notes" ON notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view all events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- Study Groups policies
CREATE POLICY "Users can view all study groups" ON study_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create study groups" ON study_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own study groups" ON study_groups FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own study groups" ON study_groups FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- Jobs policies
CREATE POLICY "Users can view all jobs" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create jobs" ON jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE TO authenticated USING (auth.uid() = poster_id);
CREATE POLICY "Users can delete own jobs" ON jobs FOR DELETE TO authenticated USING (auth.uid() = poster_id);

-- Mentorship requests policies
CREATE POLICY "Users can view own mentorship requests" ON mentorship_requests FOR SELECT TO authenticated 
  USING (auth.uid() = requester_id OR auth.uid() = mentor_id);
CREATE POLICY "Users can create mentorship requests" ON mentorship_requests FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Mentors can update requests" ON mentorship_requests FOR UPDATE TO authenticated 
  USING (auth.uid() = mentor_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Resume templates policies (public read)
CREATE POLICY "Anyone can view resume templates" ON resume_templates FOR SELECT TO authenticated USING (true);

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view public resumes" ON resumes FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can create resumes" ON resumes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON resumes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Junction table policies
CREATE POLICY "Users can view event attendees" ON event_attendees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join events" ON event_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON event_attendees FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view study group members" ON study_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join study groups" ON study_group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave study groups" ON study_group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view post likes" ON post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view note likes" ON note_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like notes" ON note_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike notes" ON note_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Insert default resume templates
INSERT INTO resume_templates (name, description, template_data, preview_url) VALUES
('Modern Professional', 'Clean and modern design perfect for tech roles', 
 '{"sections": ["header", "summary", "experience", "education", "skills", "projects"], "style": "modern", "color": "#3b82f6"}',
 '/templates/modern-professional.png'),
('Classic Academic', 'Traditional format ideal for academic and research positions',
 '{"sections": ["header", "education", "research", "publications", "experience", "skills"], "style": "classic", "color": "#1f2937"}',
 '/templates/classic-academic.png'),
('Creative Portfolio', 'Showcase your creativity with this design-focused template',
 '{"sections": ["header", "portfolio", "experience", "skills", "education"], "style": "creative", "color": "#8b5cf6"}',
 '/templates/creative-portfolio.png');