-- ========================================
-- COMPLETE DATABASE SETUP
-- Fix "Failed to save notes" Error
-- ========================================
-- Run this entire script in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ========================================

-- ========================================
-- PART 1: STORAGE BUCKET SETUP
-- ========================================

-- Create "notes" storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'notes',
    'notes',
    true,
    10485760,  -- 10MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'notes');

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text);

SELECT '✅ STORAGE BUCKET CONFIGURED' as status;

-- ========================================
-- PART 2: NOTES TABLE SETUP
-- ========================================

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT,
  file_size BIGINT,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS notes_title_idx ON notes(title);

-- Add comment to table
COMMENT ON TABLE notes IS 'Stores user uploaded study materials with metadata';

SELECT '✅ NOTES TABLE CREATED' as status;

-- ========================================
-- PART 3: NOTES TABLE RLS POLICIES
-- ========================================

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;

-- Policy 1: Allow authenticated users to insert their own notes
CREATE POLICY "Users can insert their own notes"
ON notes 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Allow users to read their own notes
CREATE POLICY "Users can read their own notes"
ON notes 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Allow users to update their own notes
CREATE POLICY "Users can update their own notes"
ON notes 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
ON notes 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

SELECT '✅ NOTES RLS POLICIES CREATED' as status;

-- ========================================
-- PART 4: GENERATED_CONTENT TABLE SETUP
-- ========================================

-- Create generated_content table for AI-generated summaries, quizzes, flashcards
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('summary', 'quiz', 'flashcards')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS generated_content_note_id_idx ON generated_content(note_id);
CREATE INDEX IF NOT EXISTS generated_content_user_id_idx ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS generated_content_type_idx ON generated_content(type);
CREATE INDEX IF NOT EXISTS generated_content_created_at_idx ON generated_content(created_at DESC);

-- Add comment
COMMENT ON TABLE generated_content IS 'Stores AI-generated content (summaries, quizzes, flashcards)';

SELECT '✅ GENERATED_CONTENT TABLE CREATED' as status;

-- ========================================
-- PART 5: GENERATED_CONTENT RLS POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can read their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can update their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can delete their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can manage their own content" ON generated_content;

-- Create policies
CREATE POLICY "Users can insert their own content"
ON generated_content 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own content"
ON generated_content 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
ON generated_content 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
ON generated_content 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

SELECT '✅ GENERATED_CONTENT RLS POLICIES CREATED' as status;

-- ========================================
-- PART 6: HELPER FUNCTIONS
-- ========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for notes table
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT '✅ HELPER FUNCTIONS CREATED' as status;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- 1. Check storage bucket
SELECT 
    '=== STORAGE BUCKET ===' as section,
    id,
    name,
    public,
    file_size_limit / 1024 / 1024 as "size_limit_mb",
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'notes';

-- 2. Check storage policies
SELECT 
    '=== STORAGE POLICIES ===' as section,
    policyname,
    cmd as operation,
    CASE 
        WHEN roles = '{authenticated}' THEN 'authenticated'
        WHEN roles = '{public}' THEN 'public'
        ELSE roles::text
    END as role
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%files%'
ORDER BY policyname;

-- 3. Check notes table structure
SELECT 
    '=== NOTES TABLE STRUCTURE ===' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- 4. Check notes table RLS
SELECT 
    '=== NOTES TABLE RLS ===' as section,
    tablename,
    rowsecurity as "RLS_enabled"
FROM pg_tables 
WHERE tablename = 'notes';

-- 5. Check notes policies
SELECT 
    '=== NOTES POLICIES ===' as section,
    policyname,
    cmd as operation,
    CASE 
        WHEN roles = '{authenticated}' THEN 'authenticated'
        WHEN roles = '{public}' THEN 'public'
        ELSE roles::text
    END as role
FROM pg_policies 
WHERE tablename = 'notes'
ORDER BY policyname;

-- 6. Check generated_content table
SELECT 
    '=== GENERATED_CONTENT TABLE ===' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'generated_content'
ORDER BY ordinal_position;

-- 7. Check generated_content policies
SELECT 
    '=== GENERATED_CONTENT POLICIES ===' as section,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename = 'generated_content'
ORDER BY policyname;

-- 8. Count existing data
SELECT 
    '=== DATA SUMMARY ===' as section,
    (SELECT COUNT(*) FROM notes) as total_notes,
    (SELECT COUNT(*) FROM generated_content) as total_generated_content;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT 
    '🎉 SETUP COMPLETE!' as status,
    'Your Supabase database is fully configured.' as message,
    'Storage bucket "notes" is ready.' as storage,
    'Table "notes" is ready for inserts.' as database,
    'All RLS policies are in place.' as security;

-- ========================================
-- NEXT STEPS
-- ========================================

-- 1. Go to your app: http://localhost:8000/public/upload.html
-- 2. Log in with your account
-- 3. Upload a PDF or image file
-- 4. Check console for: "✅ Note saved successfully"
-- 5. Verify note appears in Table Editor
-- 6. Check file appears in Storage

-- ========================================
-- TROUBLESHOOTING QUERIES
-- ========================================

-- If insert fails, run these to debug:

-- Check if you're authenticated:
-- SELECT auth.uid();

-- Try manual insert (replace with your user ID):
-- INSERT INTO notes (user_id, title, file_name, file_url)
-- VALUES (auth.uid(), 'Test Note', 'test.pdf', 'https://example.com/test.pdf');

-- Check recent notes:
-- SELECT * FROM notes ORDER BY created_at DESC LIMIT 5;

-- Check policies are working:
-- SELECT * FROM notes WHERE user_id = auth.uid();

-- Check for errors in logs:
-- Go to Dashboard → Logs → Postgres Logs

