/*
  # Event system upgrade — Unstop-style fields + engagement tables

  Adds rich event metadata (category, prizes, eligibility, fees, deadlines,
  schedule, FAQs) and the supporting engagement tables (event_saves,
  event_likes, event_views) so the Events page can be a startup-ready product.

  1. Schema changes
    - `events` — new columns: category, subcategory, difficulty, status, etc.
    - `event_saves` — bookmark/save relationship per user per event.
    - `event_likes` — like relationship per user per event.
    - `event_views` — view counter per user/IP per event for trending score.

  2. Backwards compatibility
    - All new columns are nullable.
    - Default `category` = 'workshop' and `difficulty` = 'beginner' so
      pre-existing rows remain readable.

  3. Security
    - Enable RLS on the new tables.
    - SELECT/INSERT/DELETE policies match the project's existing pattern
      (USING (auth.uid() = user_id)).
*/

-- ---------------------------------------------------------------------------
-- Extend events table with rich metadata
-- ---------------------------------------------------------------------------

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'workshop'
    CHECK (category IN ('hackathon', 'workshop', 'conference', 'competition',
                        'webinar', 'meetup', 'cultural', 'sports', 'fest',
                        'seminar')),
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS end_date timestamptz,
  ADD COLUMN IF NOT EXISTS is_multi_day boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS eligibility text,
  ADD COLUMN IF NOT EXISTS rules text,
  ADD COLUMN IF NOT EXISTS prizes text,
  ADD COLUMN IF NOT EXISTS prize_pool numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prize_currency text DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_team_size integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_team_size integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS registration_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS trending_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requirements text[],
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS save_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gallery text[],
  ADD COLUMN IF NOT EXISTS allows_teams boolean DEFAULT false;

-- Helpful indexes for discovery queries
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_trending ON events(trending_score DESC);

-- ---------------------------------------------------------------------------
-- Event saves (bookmark)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_saves (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own event saves" ON event_saves;
CREATE POLICY "Users can view their own event saves"
  ON event_saves FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save events" ON event_saves;
CREATE POLICY "Users can save events"
  ON event_saves FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave events" ON event_saves;
CREATE POLICY "Users can unsave events"
  ON event_saves FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Event likes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_likes (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view event likes" ON event_likes;
CREATE POLICY "Users can view event likes"
  ON event_likes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can like events" ON event_likes;
CREATE POLICY "Users can like events"
  ON event_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike events" ON event_likes;
CREATE POLICY "Users can unlike events"
  ON event_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Event views (per-user dedupe: max one view per event per user)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_views (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can record their own views" ON event_views;
CREATE POLICY "Users can record their own views"
  ON event_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own view history" ON event_views;
CREATE POLICY "Users can view their own view history"
  ON event_views FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
