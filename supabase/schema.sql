-- ============================================================================
-- Studex2.0 Complete Schema
-- Run this entire script in your Supabase dashboard → SQL Editor → New Query
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Base schema (migration: 20250927065456_small_block.sql)
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  max_members integer NOT NULL,
  is_private boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resume_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL,
  preview_url text,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES resume_templates(id),
  title text NOT NULL,
  resume_data jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_attendees (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS study_group_members (
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS note_likes (
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (note_id, user_id)
);

-- Enable RLS on all base tables
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

-- Base RLS Policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all posts" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view all notes" ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create notes" ON notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view all events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

CREATE POLICY "Users can view all study groups" ON study_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create study groups" ON study_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own study groups" ON study_groups FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own study groups" ON study_groups FOR DELETE TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Users can view all jobs" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create jobs" ON jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE TO authenticated USING (auth.uid() = poster_id);
CREATE POLICY "Users can delete own jobs" ON jobs FOR DELETE TO authenticated USING (auth.uid() = poster_id);

CREATE POLICY "Users can view own mentorship requests" ON mentorship_requests FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = mentor_id);
CREATE POLICY "Users can create mentorship requests" ON mentorship_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Mentors can update requests" ON mentorship_requests FOR UPDATE TO authenticated USING (auth.uid() = mentor_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view resume templates" ON resume_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view public resumes" ON resumes FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can create resumes" ON resumes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON resumes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE TO authenticated USING (auth.uid() = user_id);

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

INSERT INTO resume_templates (name, description, template_data, preview_url) VALUES
('Modern Professional', 'Clean and modern design perfect for tech roles', '{"sections": ["header", "summary", "experience", "education", "skills", "projects"], "style": "modern", "color": "#3b82f6"}', '/templates/modern-professional.png'),
('Classic Academic', 'Traditional format ideal for academic and research positions', '{"sections": ["header", "education", "research", "publications", "experience", "skills"], "style": "classic", "color": "#1f2937"}', '/templates/classic-academic.png'),
('Creative Portfolio', 'Showcase your creativity with this design-focused template', '{"sections": ["header", "portfolio", "experience", "skills", "education"], "style": "creative", "color": "#8b5cf6"}', '/templates/creative-portfolio.png');

-- ---------------------------------------------------------------------------
-- 2. Username + chat core (migration: 20250101000000_add_chat_and_username.sql)
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  file_url text,
  file_name text,
  file_type text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
  FOR SELECT USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can join conversations" ON conversation_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own participation" ON conversation_participants FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid() AND conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (sender_id = auth.uid());

CREATE OR REPLACE FUNCTION update_conversation_updated_at() RETURNS TRIGGER AS $$
BEGIN UPDATE conversations SET updated_at = NEW.created_at WHERE id = NEW.conversation_id; RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_timestamp ON messages;
CREATE TRIGGER update_conversation_timestamp AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_conversation_updated_at();

CREATE OR REPLACE FUNCTION generate_username_from_email(email text) RETURNS text AS $$
DECLARE base_username text; final_username text; counter integer := 0;
BEGIN
  base_username := lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
  IF base_username = '' THEN base_username := 'user'; END IF;
  IF length(base_username) < 3 THEN base_username := base_username || '123'; END IF;
  IF length(base_username) > 15 THEN base_username := left(base_username, 15); END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1; final_username := base_username || counter::text;
    IF counter > 9999 THEN final_username := base_username || extract(epoch from now())::text; EXIT; END IF;
  END LOOP;
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

UPDATE profiles SET username = generate_username_from_email(email) WHERE username IS NULL;
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

CREATE OR REPLACE FUNCTION update_last_seen() RETURNS TRIGGER AS $$
BEGIN UPDATE profiles SET last_seen = now() WHERE user_id = auth.uid(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_last_seen ON profiles;
CREATE TRIGGER update_user_last_seen AFTER INSERT OR UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_last_seen();

-- ---------------------------------------------------------------------------
-- 3. Community access level (migration: 20250216000000_add_community_access_level.sql)
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS access_level text DEFAULT 'full' CHECK (access_level IN ('full', 'partial', 'read_only'));

UPDATE profiles SET access_level = CASE WHEN is_verified THEN 'full' ELSE 'read_only' END WHERE access_level IS NULL;

COMMENT ON COLUMN profiles.access_level IS 'Community access: full (verified), partial (limited write), read_only (view only)';

-- ---------------------------------------------------------------------------
-- 4. Study group join requests (migration: 20260407110000_study_group_join_requests.sql)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_study_group_join_requests_unique ON study_group_join_requests (group_id, requester_id);
CREATE INDEX IF NOT EXISTS idx_study_group_join_requests_group_status ON study_group_join_requests (group_id, status);
CREATE INDEX IF NOT EXISTS idx_study_group_join_requests_requester_status ON study_group_join_requests (requester_id, status);

ALTER TABLE study_group_join_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'study_group_members' AND policyname = 'Users can join study groups') THEN
    DROP POLICY "Users can join study groups" ON study_group_members;
  END IF;
END $$;

CREATE POLICY "Users can join eligible study groups" ON study_group_members FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM study_groups g WHERE g.id = group_id AND (
      g.is_private = false OR EXISTS (
        SELECT 1 FROM study_group_join_requests r WHERE r.group_id = group_id AND r.requester_id = auth.uid() AND r.status = 'accepted'
      )
    ) AND (SELECT COUNT(*) FROM study_group_members m WHERE m.group_id = group_id) < g.max_members
  )
);

CREATE POLICY "Requesters can view own join requests" ON study_group_join_requests FOR SELECT TO authenticated USING (auth.uid() = requester_id);
CREATE POLICY "Creators can view join requests on own groups" ON study_group_join_requests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM study_groups g WHERE g.id = group_id AND g.creator_id = auth.uid())
);
CREATE POLICY "Users can create own join requests" ON study_group_join_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Creators can update join request status" ON study_group_join_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM study_groups g WHERE g.id = group_id AND g.creator_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM study_groups g WHERE g.id = group_id AND g.creator_id = auth.uid())
  AND status IN ('pending', 'accepted', 'rejected')
);
CREATE POLICY "Requesters can cancel pending join requests" ON study_group_join_requests FOR DELETE TO authenticated USING (auth.uid() = requester_id AND status = 'pending');

CREATE OR REPLACE FUNCTION update_study_group_join_request_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status <> OLD.status THEN NEW.responded_at := now(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_study_group_join_requests_updated_at ON study_group_join_requests;
CREATE TRIGGER trg_update_study_group_join_requests_updated_at BEFORE UPDATE ON study_group_join_requests FOR EACH ROW EXECUTE FUNCTION update_study_group_join_request_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Event Unstop upgrade (migration: 20260617000000_event_unstop_upgrade.sql)
-- ---------------------------------------------------------------------------

ALTER TABLE events ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'workshop' CHECK (category IN ('hackathon', 'workshop', 'conference', 'competition', 'webinar', 'meetup', 'cultural', 'sports', 'fest', 'seminar'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'completed', 'cancelled'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_multi_day boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS eligibility text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS rules text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS prizes text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS prize_pool numeric DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS prize_currency text DEFAULT 'INR';
ALTER TABLE events ADD COLUMN IF NOT EXISTS fee numeric DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS min_team_size integer DEFAULT 1;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_team_size integer DEFAULT 1;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS trending_score numeric DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS requirements text[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS language text DEFAULT 'English';
ALTER TABLE events ADD COLUMN IF NOT EXISTS save_count integer DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery text[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS allows_teams boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_trending ON events(trending_score DESC);

CREATE TABLE IF NOT EXISTS event_saves (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
ALTER TABLE event_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own event saves" ON event_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can save events" ON event_saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave events" ON event_saves FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS event_likes (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view event likes" ON event_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like events" ON event_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike events" ON event_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS event_views (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
ALTER TABLE event_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can record their own views" ON event_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own view history" ON event_views FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6. Study group upgrade (migration: 20260617010000_study_group_upgrade.sql)
-- ---------------------------------------------------------------------------

ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS meeting_location text;
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS meeting_link text;
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS next_session_at timestamptz;
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_private ON study_groups(is_private);

ALTER TABLE study_group_members ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin'));
ALTER TABLE study_group_members ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(group_id);

ALTER TABLE study_group_join_requests ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE study_group_join_requests ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE study_group_join_requests ADD COLUMN IF NOT EXISTS message text;

CREATE TABLE IF NOT EXISTS study_group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  file_url text,
  file_name text,
  reply_to_message_id uuid REFERENCES study_group_messages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_group_messages_group_created_at ON study_group_messages (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_group_messages_sender_id ON study_group_messages (sender_id);

ALTER TABLE study_group_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'study_group_messages' AND policyname = 'Members can view group messages') THEN
    DROP POLICY "Members can view group messages" ON study_group_messages;
  END IF;
END $$;

CREATE POLICY "Members can view group messages" ON study_group_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = study_group_messages.group_id AND m.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_messages.group_id AND g.creator_id = auth.uid())
);
CREATE POLICY "Members can send group messages" ON study_group_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND (
    EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = study_group_messages.group_id AND m.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_messages.group_id AND g.creator_id = auth.uid())
  )
);
CREATE POLICY "Senders can edit their group messages" ON study_group_messages FOR UPDATE TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Senders can delete their group messages" ON study_group_messages FOR DELETE TO authenticated USING (sender_id = auth.uid());

CREATE OR REPLACE FUNCTION update_study_group_timestamps() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_study_groups_updated_at ON study_groups;
CREATE TRIGGER trg_update_study_groups_updated_at BEFORE UPDATE ON study_groups FOR EACH ROW EXECUTE FUNCTION update_study_group_timestamps();
DROP TRIGGER IF EXISTS trg_update_study_group_members_updated_at ON study_group_members;
CREATE TRIGGER trg_update_study_group_members_updated_at BEFORE UPDATE ON study_group_members FOR EACH ROW EXECUTE FUNCTION update_study_group_timestamps();
DROP TRIGGER IF EXISTS trg_update_study_group_messages_updated_at ON study_group_messages;
CREATE TRIGGER trg_update_study_group_messages_updated_at BEFORE UPDATE ON study_group_messages FOR EACH ROW EXECUTE FUNCTION update_study_group_timestamps();

-- ---------------------------------------------------------------------------
-- 7. Functional study-group tables (migration: 20260618000000_study_group_functional.sql)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS study_group_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_group_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text,
  file_name text,
  file_size bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_group_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  topic text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  meeting_link text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_group_announcements_group_created_at ON study_group_announcements (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_group_resources_group_created_at ON study_group_resources (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_group_sessions_group_starts_at ON study_group_sessions (group_id, starts_at DESC);

ALTER TABLE study_group_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view group announcements" ON study_group_announcements;
DROP POLICY IF EXISTS "Creators can manage group announcements" ON study_group_announcements;

CREATE POLICY "Members can view group announcements" ON study_group_announcements FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = study_group_announcements.group_id AND m.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_announcements.group_id AND g.creator_id = auth.uid())
);
CREATE POLICY "Creators can manage group announcements" ON study_group_announcements FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_announcements.group_id AND g.creator_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_announcements.group_id AND g.creator_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can view group resources" ON study_group_resources;
DROP POLICY IF EXISTS "Members can upload group resources" ON study_group_resources;
DROP POLICY IF EXISTS "Uploaders can delete own group resources" ON study_group_resources;

CREATE POLICY "Members can view group resources" ON study_group_resources FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = study_group_resources.group_id AND m.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_resources.group_id AND g.creator_id = auth.uid())
);
CREATE POLICY "Members can upload group resources" ON study_group_resources FOR INSERT TO authenticated WITH CHECK (
  uploaded_by = auth.uid() AND (
    EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = study_group_resources.group_id AND m.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_resources.group_id AND g.creator_id = auth.uid())
  )
);
CREATE POLICY "Uploaders can delete own group resources" ON study_group_resources FOR DELETE TO authenticated USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Members can view group sessions" ON study_group_sessions;
DROP POLICY IF EXISTS "Creators can manage group sessions" ON study_group_sessions;

CREATE POLICY "Members can view group sessions" ON study_group_sessions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = study_group_sessions.group_id AND m.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_sessions.group_id AND g.creator_id = auth.uid())
);
CREATE POLICY "Creators can manage group sessions" ON study_group_sessions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_sessions.group_id AND g.creator_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_sessions.group_id AND g.creator_id = auth.uid())
);

DROP TRIGGER IF EXISTS trg_update_study_group_announcements_updated_at ON study_group_announcements;
CREATE TRIGGER trg_update_study_group_announcements_updated_at BEFORE UPDATE ON study_group_announcements FOR EACH ROW EXECUTE FUNCTION update_study_group_timestamps();
DROP TRIGGER IF EXISTS trg_update_study_group_sessions_updated_at ON study_group_sessions;
CREATE TRIGGER trg_update_study_group_sessions_updated_at BEFORE UPDATE ON study_group_sessions FOR EACH ROW EXECUTE FUNCTION update_study_group_timestamps();

-- ---------------------------------------------------------------------------
-- DONE! All tables, indexes, policies, and triggers created.
-- Next: create a storage bucket named "study-group-files" in the Storage tab
-- and add the RLS policies from the storage-setup instructions.
-- ---------------------------------------------------------------------------
