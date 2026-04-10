-- Study group join-request workflow for private groups

CREATE TABLE IF NOT EXISTS study_group_join_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_study_group_join_requests_unique
  ON study_group_join_requests (group_id, requester_id);

CREATE INDEX IF NOT EXISTS idx_study_group_join_requests_group_status
  ON study_group_join_requests (group_id, status);

CREATE INDEX IF NOT EXISTS idx_study_group_join_requests_requester_status
  ON study_group_join_requests (requester_id, status);

ALTER TABLE study_group_join_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'study_group_members'
      AND policyname = 'Users can join study groups'
  ) THEN
    DROP POLICY "Users can join study groups" ON study_group_members;
  END IF;
END $$;

CREATE POLICY "Users can join eligible study groups"
ON study_group_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM study_groups g
    WHERE g.id = group_id
      AND (
        g.is_private = false
        OR EXISTS (
          SELECT 1
          FROM study_group_join_requests r
          WHERE r.group_id = group_id
            AND r.requester_id = auth.uid()
            AND r.status = 'accepted'
        )
      )
      AND (
        SELECT COUNT(*)
        FROM study_group_members m
        WHERE m.group_id = group_id
      ) < g.max_members
  )
);

CREATE POLICY "Requesters can view own join requests"
ON study_group_join_requests
FOR SELECT
TO authenticated
USING (auth.uid() = requester_id);

CREATE POLICY "Creators can view join requests on own groups"
ON study_group_join_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM study_groups g
    WHERE g.id = group_id
      AND g.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can create own join requests"
ON study_group_join_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Creators can update join request status"
ON study_group_join_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM study_groups g
    WHERE g.id = group_id
      AND g.creator_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM study_groups g
    WHERE g.id = group_id
      AND g.creator_id = auth.uid()
  )
  AND status IN ('pending', 'accepted', 'rejected')
);

CREATE POLICY "Requesters can cancel pending join requests"
ON study_group_join_requests
FOR DELETE
TO authenticated
USING (auth.uid() = requester_id AND status = 'pending');

CREATE OR REPLACE FUNCTION update_study_group_join_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status <> OLD.status THEN
    NEW.responded_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_study_group_join_requests_updated_at ON study_group_join_requests;
CREATE TRIGGER trg_update_study_group_join_requests_updated_at
  BEFORE UPDATE ON study_group_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_study_group_join_request_updated_at();
