-- Study group schema upgrade for richer group pages and persistent chat

ALTER TABLE study_groups
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS meeting_location text,
  ADD COLUMN IF NOT EXISTS meeting_link text,
  ADD COLUMN IF NOT EXISTS next_session_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_private ON study_groups(is_private);

ALTER TABLE study_group_members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(group_id);

ALTER TABLE study_group_join_requests
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS message text;

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

CREATE INDEX IF NOT EXISTS idx_study_group_messages_group_created_at
  ON study_group_messages (group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_study_group_messages_sender_id
  ON study_group_messages (sender_id);

ALTER TABLE study_group_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'study_group_messages'
      AND policyname = 'Members can view group messages'
  ) THEN
    DROP POLICY "Members can view group messages" ON study_group_messages;
  END IF;
END $$;

CREATE POLICY "Members can view group messages"
ON study_group_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM study_group_members m
    WHERE m.group_id = study_group_messages.group_id
      AND m.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM study_groups g
    WHERE g.id = study_group_messages.group_id
      AND g.creator_id = auth.uid()
  )
);

CREATE POLICY "Members can send group messages"
ON study_group_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1
      FROM study_group_members m
      WHERE m.group_id = study_group_messages.group_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM study_groups g
      WHERE g.id = study_group_messages.group_id
        AND g.creator_id = auth.uid()
    )
  )
);

CREATE POLICY "Senders can edit their group messages"
ON study_group_messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Senders can delete their group messages"
ON study_group_messages
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

CREATE OR REPLACE FUNCTION update_study_group_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_study_groups_updated_at ON study_groups;
CREATE TRIGGER trg_update_study_groups_updated_at
  BEFORE UPDATE ON study_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_study_group_timestamps();

DROP TRIGGER IF EXISTS trg_update_study_group_members_updated_at ON study_group_members;
CREATE TRIGGER trg_update_study_group_members_updated_at
  BEFORE UPDATE ON study_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_study_group_timestamps();

DROP TRIGGER IF EXISTS trg_update_study_group_messages_updated_at ON study_group_messages;
CREATE TRIGGER trg_update_study_group_messages_updated_at
  BEFORE UPDATE ON study_group_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_study_group_timestamps();
