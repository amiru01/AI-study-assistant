-- ========================================
-- QUICK FIX: Run this entire script in Supabase SQL Editor
-- This will fix both email confirmation and upload issues
-- ========================================

-- 1. CREATE STORAGE BUCKET (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', false)
ON CONFLICT (id) DO NOTHING;

-- 2. DROP EXISTING STORAGE POLICIES (clean slate)
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- 3. CREATE STORAGE POLICIES (allow users to manage their files)
CREATE POLICY "Users can upload their own files"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own files"
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files"
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. CREATE NOTES TABLE (if not exists)
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY ON NOTES
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 6. DROP EXISTING NOTES POLICIES
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- 7. CREATE NOTES POLICIES
CREATE POLICY "Users can manage their own notes"
ON notes 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. CREATE GENERATED_CONTENT TABLE (if not exists)
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ENABLE ROW LEVEL SECURITY ON GENERATED_CONTENT
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- 10. DROP EXISTING GENERATED_CONTENT POLICIES
DROP POLICY IF EXISTS "Users can manage their own content" ON generated_content;

-- 11. CREATE GENERATED_CONTENT POLICIES
CREATE POLICY "Users can manage their own content"
ON generated_content 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- DONE! Your Supabase is now configured correctly
-- ========================================

-- To verify, run these queries:
SELECT * FROM storage.buckets WHERE id = 'notes';
SELECT * FROM pg_policies WHERE tablename = 'notes';
SELECT * FROM pg_policies WHERE tablename = 'generated_content';
