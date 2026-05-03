-- ========================================
-- QUICK FIX: GENERATED_CONTENT TABLE
-- Fix "Failed to save generated summary" Error
-- ========================================
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ========================================

-- 1. Create generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('summary', 'quiz', 'flashcards')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS generated_content_note_id_idx ON generated_content(note_id);
CREATE INDEX IF NOT EXISTS generated_content_user_id_idx ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS generated_content_type_idx ON generated_content(type);

-- 3. Enable RLS
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies
DROP POLICY IF EXISTS "Users can insert their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can read their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can update their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can delete their own content" ON generated_content;

-- 5. Create policies
CREATE POLICY "Users can insert their own content"
ON generated_content FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own content"
ON generated_content FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
ON generated_content FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
ON generated_content FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ========================================
-- VERIFY
-- ========================================

SELECT 'Table:' as check, COUNT(*) FROM information_schema.tables WHERE table_name = 'generated_content';
SELECT 'Policies:' as check, COUNT(*) FROM pg_policies WHERE tablename = 'generated_content';
SELECT '✅ READY!' as status;
