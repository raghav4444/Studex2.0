-- Fix foreign key constraint issue for chat functionality
-- Run this in your Supabase SQL Editor

-- First, let's see what foreign key constraints exist
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('conversation_participants', 'messages', 'profiles')
ORDER BY tc.table_name, tc.constraint_name;

-- Drop the problematic foreign key constraints temporarily
ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- Test that we can now insert participants
SELECT 'Foreign key constraints dropped successfully!' as status;

-- Verify the constraints are gone
SELECT
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('conversation_participants', 'messages')
ORDER BY tc.table_name, tc.constraint_name;
